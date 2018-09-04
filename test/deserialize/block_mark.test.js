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

      if (node.type === "paragraph") {
        return {
          object: "block",
          type: "paragraph",
          nodes: next(node.children)
        };
      }

      if (node.type === "link") {
        return {
          object: "inline",
          type: "link",
          nodes: next(node.children)
        };
      }

      if (node.type === "bold") {
        return {
          object: "mark",
          type: "bold",
          nodes: next(node.children)
        };
      }

      if (node.type === "italics") {
        return {
          object: "mark",
          type: "italics",
          nodes: next(node.children)
        };
      }

      if (node.type === "text") {
        return {
          object: "text",
          leaves: [{ object: "leaf", text: node.value }]
        };
      }
    }
  }
];

const input = u("root", [
  u("paragraph", [
    u("text", "one"),
    u("bold", [u("text", "two")]),
    u("bold", [u("italics", [u("text", "three")])]),
    u("bold", [u("link", [u("text", "four")])])
  ])
]);

test("deserialize marked blocks", () => {
  const serializer = new Serializer({ rules });
  const output = serializer.deserialize(input).toJSON();
  expect(output).toMatchSnapshot();
});
