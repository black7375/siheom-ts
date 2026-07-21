import type { BaseEditor, BaseElement, BaseText } from "slate";
import type { ReactEditor } from "slate-react";

type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

type CustomText = BaseText;

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: BaseElement & ParagraphElement;
    Text: CustomText;
  }
}
