import h from "slate-hyperscript";
import u from "unist-builder";
import Serializer from "../../src";

const rules = [
  {
    serialize(obj, children) {
      if (obj.object === "document") {
        return { type: "root", children };
      }

      if (obj.object === "block" && obj.type === "paragraph") {
        return { type: "paragraph", children };
      }

      if (obj.object === "mark" && obj.type === "bold") {
        return { type: "bold", children };
      }

      if (obj.object === "mark" && obj.type === "italics") {
        return { type: "italics", children };
      }

      if (obj.object === "string") {
        return { type: "text", value: obj.text };
      }
    }
  }
];

const value = h(
  "value",
  h(
    "document",
    h(
      "block",
      { type: "paragraph" },
      "one",
      h("mark", { type: "bold" }, "two"),
      h("mark", { type: "bold" }, h("mark", { type: "italics" }, "three"))
    )
  )
);

const expected = u("root", [
  u("paragraph", [
    u("text", "one"),
    u("bold", [u("text", "two")]),
    u("bold", [u("italics", [u("text", "three")])])
  ])
]);

test("serialize simple blocks", () => {
  const serializer = new Serializer({ rules });
  const actual = serializer.serialize(value);
  expect(actual).toEqual(expected);
});
