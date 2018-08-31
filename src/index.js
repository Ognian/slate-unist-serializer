import { Value } from "slate";
import { Record } from "immutable";

const String = new Record({
  object: "string",
  text: ""
});

class Serializer {
  constructor(options) {
    this.rules = options.rules;
  }

  serialize(value) {
    const elements = value.document.nodes
      .map(node => this.serializeNode(node))
      .toArray();

    return { type: "root", children: elements };
  }

  serializeNode(node) {
    if (node.object === "text") {
      const leaves = node.getLeaves();
      debugger;
      return leaves.map(leaf => this.serializeLeaf(leaf)).toArray();
    }

    const children = node.nodes
      .map(node => this.serializeNode(node))
      .reduce((acc, value) => {
        return Array.isArray(value) ? [...acc, ...value] : [...acc, value];
      }, []);

    for (const rule of this.rules) {
      if (!rule.serialize) continue;
      const ret = rule.serialize(node, children);
      if (ret === null) return;
      if (ret) return ret;
    }
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
    }, text);
  }

  serializeString(string) {
    for (const rule of this.rules) {
      if (!rule.serialize) continue;
      const ret = rule.serialize(string);
      if (ret) return ret;
    }
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

    if (node.type === "quote") debugger;

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

export default Serializer;
