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

export interface String {
  object: "string";
  text: string;
}

type InputNode = Document | Block | Inline | Mark | String;
type OutputNode = DocumentJSON | BlockJSON | InlineJSON | MarkJSON | TextJSON;

export interface Rule<Node> {
  serialize?: (node: InputNode, children: Node[]) => Node | null | undefined;
  deserialize?: (
    node: Node,
    next: (nodes: Node[]) => OutputNode[]
  ) => OutputNode | null | undefined;
}

interface Options<Node> {
  rules: Rule<Node>[];
}

export class Serializer<Node> {
  constructor(options: Options<Node>);

  serialize(value: Value): Node;
  deserialize(node: Node): Value;
}
