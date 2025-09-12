import type { StrapiApp } from "@strapi/strapi/admin";

export default {
  config: {
    locales: ["en"],
    plugins: {
      ckeditor: {
        config: {
          editor: {
            toolbar: {
              shouldNotGroupWhenFull: true,
              items: [
                "undo",
                "redo",
                "|",
                "heading",
                "|",
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "removeFormat",
                "|",
                "fontSize",
                "fontFamily",
                "fontColor",
                "fontBackgroundColor",
                "|",
                "link",
                "blockQuote",
                "code",
                "codeBlock",
                "insertTable",
                "mediaEmbed",
                "imageUpload",
                "|",
                "bulletedList",
                "numberedList",
                "todoList",
                "outdent",
                "indent",
                "|",
                "alignment",
                "horizontalLine",
                "pageBreak",
                "specialCharacters",
                "|",
                "findAndReplace",
                "highlight",
                "|",
                "sourceEditing",
              ],
            },
            image: {
              toolbar: [
                "imageTextAlternative",
                "toggleImageCaption",
                "imageStyle:inline",
                "imageStyle:block",
                "imageStyle:side",
                "linkImage",
              ],
            },
            table: {
              contentToolbar: [
                "tableColumn",
                "tableRow",
                "mergeTableCells",
                "tableProperties",
                "tableCellProperties",
              ],
            },
          },
        },
      },
    },
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
