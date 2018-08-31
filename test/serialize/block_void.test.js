import h from "slate-hyperscript";
import u from "unist-builder";
import Serializer from "../../src";

const rules = [
  {
    serialize(obj, children) {
      if (obj.object === "document") {
        return { type: "root", children };
      }

      if (obj.object === "block" && obj.type === "image") {
        return { type: "image" };
      }
    }
  }
];

const value = h("value", [h("document", [h("block", { type: "image" })])]);

const expected = u("root", [u("image")]);

test("serialize void blocks", () => {
  const serializer = new Serializer({ rules });
  const actual = serializer.serialize(value);
  expect(actual).toEqual(expected);
});
