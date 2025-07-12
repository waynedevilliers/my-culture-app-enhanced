import {
    Block,
    BlockNoteSchema,
    combineByGroup, defaultBlockSpecs,
    filterSuggestionItems,
    locales, PartialBlock,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
    SuggestionMenuController,
    getDefaultReactSlashMenuItems,
    useCreateBlockNote, FormattingToolbarController, FormattingToolbar, blockTypeSelectItems, BlockTypeSelectItem,
} from "@blocknote/react";
import {
    getMultiColumnSlashMenuItems,
    multiColumnDropCursor,
    locales as multiColumnLocales,
    withMultiColumn,
} from "@blocknote/xl-multi-column";
import { useEffect, useMemo, useState } from "react";
import { uploadFile } from "../../utils/editor";
import { RiAlertFill } from "react-icons/ri";
import { Alert } from "./Alert";

async function saveToStorage(jsonBlocks: Block[]) {
    // Save contents to local storage. You might want to debounce this or replace
    // with a call to your API / database.
    localStorage.setItem("editorContent", JSON.stringify(jsonBlocks));
}

// @ts-ignore
const Editor = ({ content }: { content: PartialBlock }) => {
    const [editorContent, setEditorContent] = useState<PartialBlock[] | undefined>(undefined);

    useEffect(() => {
        setEditorContent(
            content
                ? content as PartialBlock[]
                : undefined
        )
    }, []);

    const onChange = async () => {
        const html = await editor.blocksToHTMLLossy(editor.document);
        // @ts-ignore
        await saveToStorage(editor.document)
        localStorage.setItem("htmlContent", html);
    }

    const editor = useCreateBlockNote({
        schema: withMultiColumn(BlockNoteSchema.create({
            blockSpecs:
                {
                    ...defaultBlockSpecs,
                    video: undefined as any,
                    file: undefined as any,
                    audio: undefined as any,
                    alert: Alert,
                }
        })),
        dropCursor: multiColumnDropCursor,
        dictionary: {
            ...locales.en,
            multi_column: multiColumnLocales.en,
        },
        initialContent: editorContent,
        uploadFile: uploadFile,
    }, [editorContent]);

    const slashMenuItems = useMemo(() => {
        return combineByGroup(
            getDefaultReactSlashMenuItems(editor),
            getMultiColumnSlashMenuItems(editor)
        );
    }, [editor]);

    return (
        <BlockNoteView
            editor={editor}
            slashMenu={false}
            formattingToolbar={false} // @ts-ignore
            onChange={onChange}>
            <FormattingToolbarController
                formattingToolbar={() => (
                    <FormattingToolbar
                        blockTypeSelectItems={[
                            ...blockTypeSelectItems(editor.dictionary),
                            {
                                name: "Alert",
                                type: "alert",
                                icon: RiAlertFill,
                                isSelected: (block) => block.type === "alert",
                            } satisfies BlockTypeSelectItem,
                        ]}
                    />
                )}
            />
            <SuggestionMenuController
                triggerCharacter={"/"} // @ts-ignore
                getItems={async (query) => filterSuggestionItems(slashMenuItems, query)}
            />
        </BlockNoteView>
    );
}

export default Editor;
