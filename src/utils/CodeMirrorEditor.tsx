import { useEffect, useRef } from "react";
import { EditorState, Transaction, Compartment } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function CodeMirrorEditor({ value, onChange, disabled = false }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isInternalUpdateRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const editableCompartmentRef = useRef<Compartment | null>(null);

  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current) return;

    const editableCompartment = new Compartment();
    editableCompartmentRef.current = editableCompartment;

    const updateListener = EditorView.updateListener.of((update: { docChanged: boolean; state: EditorState; transactions: readonly Transaction[] }) => {
      if (update.docChanged && !isInternalUpdateRef.current) {
        const text = update.state.doc.toString();
        onChangeRef.current(text);
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        keymap.of(defaultKeymap),
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
        }),
        oneDark,
        EditorView.lineWrapping,
        updateListener,
        editableCompartment.of(EditorView.editable.of(!disabled)),
        EditorView.theme({
          "&": {
            height: "100%",
          },
          ".cm-content": {
            padding: "1rem",
            minHeight: "100%",
            fontSize: "14px",
            lineHeight: "1.6",
            wordWrap: "break-word",
            overflowWrap: "break-word",
          },
          ".cm-scroller": {
            overflow: "auto",
          },
          ".cm-editor": {
            height: "100%",
          },
          ".cm-focused": {
            outline: "none",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
      editableCompartmentRef.current = null;
    };
  }, []); // Only run once on mount

  // Update editor if external content changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const current = view.state.doc.toString();
    if (value !== current) {
      isInternalUpdateRef.current = true;
      
      // Replace the entire document and let CodeMirror handle selection automatically
      // This avoids selection out-of-bounds errors
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
      
      // Reset flag after dispatch completes
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 0);
    }
  }, [value]);

  // Update disabled state using compartment
  useEffect(() => {
    const view = viewRef.current;
    const compartment = editableCompartmentRef.current;
    if (!view || !compartment) return;

    view.dispatch({
      effects: compartment.reconfigure(EditorView.editable.of(!disabled)),
    });
  }, [disabled]);

  return <div ref={editorRef} className="w-full h-full" />;
}
