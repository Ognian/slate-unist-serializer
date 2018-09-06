import { Value } from "slate";
import { Record } from "immutable";

const String = new Record({
  object: "string",
  text: ""
});

export class Serializer {
  constructor(options) {
    this.rules = options.rules;
  }

  serialize(value) {
    return this.serializeNode(value.document);
  }

  serializeNode(node) {
    if (node.object === "text") {
      const leaves = node.getLeaves();
      return leaves.map(leaf => this.serializeLeaf(leaf)).toArray();
    }

    const children = node.nodes
      .map(node => this.serializeNode(node))
      .reduce((acc, value) => {
        if (Array.isArray(value)) {
          return [...acc, ...value];
        } else if (value != null) {
          return [...acc, value];
        } else {
          return acc;
        }
      }, []);

    for (const rule of this.rules) {
      if (!rule.serialize) continue;
      const ret = rule.serialize(node, children);
      if (ret === null) return;
      if (ret) return ret;
    }

    throw new Error(
      `No serialize rule found for ${node.object} node with type ${node.type}`
    );
  }

  serializeLeaf(leaf) {
    const string = new String({ text: leaf.text });
    const text = this.serializeString(string);

    return leaf.marks.reduce((child, node) => {
      for (const rule of this.rules) {
        if (!rule.serialize) continue;
        const ret = rule.serialize(node, [child]);
        if (ret === null) return;
        if (ret) return ret;
      }

      throw new Error(
        `No serialize rule found for mark with type ${node.type}`
      );
    }, text);
  }

  serializeString(string) {
    for (const rule of this.rules) {
      if (!rule.serialize) continue;
      const ret = rule.serialize(string);
      if (ret) return ret;
    }

    throw new Error("No serialize rule found for string");
  }

  deserialize(node, options = {}) {
    const { toJSON = false } = options;

    const document = this.deserializeNode(node);
    const json = { object: "value", document };
    return toJSON ? json : Value.fromJSON(json);
  }

  deserializeNode(node) {
    const next = nodes => {
      return nodes.reduce((acc, node) => {
        const ret = this.deserializeNode(node);

        if (ret == null) {
          return acc;
        } else if (Array.isArray(ret)) {
          return [...acc, ...ret];
        } else {
          return [...acc, ret];
        }
      }, []);
    };

    for (const rule of this.rules) {
      if (!rule.deserialize) continue;
      const ret = rule.deserialize(node, next);

      if (ret === undefined) {
        continue;
      } else if (ret === null) {
        return null;
      } else if (ret.object === "mark") {
        return this.deserializeMark(ret);
      } else {
        return ret;
      }
    }

    throw new Error(
      `No deserialize rule found for ${node.object} node with type ${node.type}`
    );
  }

  deserializeMark(mark) {
    const { type, data } = mark;

    const applyMark = node => {
      if (node.object == "text") {
        node.leaves = node.leaves.map(leaf => {
          leaf.marks = leaf.marks || [];
          leaf.marks.push({ type, data });
          return leaf;
        });
      } else if (node.nodes) {
        node.nodes = node.nodes.map(applyMark);
      }

      return node;
    };

    return mark.nodes.reduce((nodes, node) => {
      const ret = applyMark(node);
      return Array.isArray(ret) ? [...nodes, ...ret] : [...nodes, ret];
    }, []);
  }
}
