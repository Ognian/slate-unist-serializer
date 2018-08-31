import u from "unist-builder";
import Serializer from "../../src";

const rules = [
  {
    deserialize(node, next) {
      if (node.type === "paragraph") {
        return {
          object: "block",
          type: "paragraph",
          nodes: next(node.children)
        };
      }
    }
  },
  {
    deserialize(node, next) {
      if (node.type === "root") {
        return {
          object: "document",
          nodes: node.children && next(node.children)
        };
      }
    }
  }
];

const input = u("root");

test("skipping deserialize rules", () => {
  const serializer = new Serializer({ rules });
  const output = serializer.deserialize(input).toJSON();
  expect(output).toMatchSnapshot();
});
