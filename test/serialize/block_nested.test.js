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

      if (obj.object === "block" && obj.type === "quote") {
        return { type: "quote", children };
      }
    }
  },
  {
    serialize(obj) {
      if (obj.object === "string") {
        return { type: "text", value: obj.text };
      }
    }
  }
];

const value = h("value", [
  h("document", [
    h("block", { type: "paragraph" }, [
      h("block", { type: "quote" }, "Hello world!")
    ])
  ])
]);

const expected = u("root", [
  u("paragraph", [u("quote", [u("text", "Hello world!")])])
]);

test("serialize nested blocks", () => {
  const serializer = new Serializer({ rules });
  const actual = serializer.serialize(value);
  expect(actual).toEqual(expected);
});
