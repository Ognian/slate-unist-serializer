import u from "unist-builder";
import { Serializer } from "../../src";

const rules = [
  {
    deserialize(node, next) {
      if (node.type === "root") {
        return {
          object: "document",
          nodes: next(node.children)
        };
      }

      if (node.type === "image") {
        return {
          object: "block",
          type: "image",
          isVoid: true
        };
      }
    }
  }
];

const input = u("root", [u("image")]);

test("deserialize empty blocks", () => {
  const serializer = new Serializer({ rules });
  const output = serializer.deserialize(input).toJSON();
  expect(output).toMatchSnapshot();
});
