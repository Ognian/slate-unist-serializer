import {
  Document,
  Block,
  Inline,
  Mark,
  DocumentJSON,
  BlockJSON,
  InlineJSON,
  MarkJSON,
  TextJSON,
  Value
} from "slate";
import { Node } from "unist";

export interface String {
  object: "string";
  text: string;
}

type InputNode = Document | Block | Inline | Mark | String;
type OutputNode = DocumentJSON | BlockJSON | InlineJSON | MarkJSON | TextJSON;

export interface Rule {
  serialize?: (node: InputNode, children: Node[]) => Node;
  deserialize?: (
    node: Node,
    next: (nodes: Node[]) => OutputNode[]
  ) => OutputNode;
}

declare class Serializer {
  constructor(options: Options);

  serialize(value: Value): Node;
  deserialize(node: Node): Value;
}

export = Serializer;
