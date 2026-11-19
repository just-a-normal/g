import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { java } from '@codemirror/lang-java';
import { bracketMatching, HighlightStyle, indentOnInput, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { drawSelection, EditorView, highlightActiveLine, keymap, lineNumbers, placeholder } from '@codemirror/view';
import { tags } from '@lezer/highlight';

const colors = HighlightStyle.define([
  { tag: [tags.keyword, tags.modifier, tags.operatorKeyword], color: 'var(--syntax-keyword)' },
  { tag: [tags.string, tags.character], color: 'var(--syntax-string)' },
  { tag: [tags.number, tags.bool, tags.null], color: 'var(--syntax-number)' },
  { tag: [tags.typeName, tags.className], color: 'var(--syntax-type)' },
  { tag: tags.comment, color: 'var(--muted)', fontStyle: 'italic' }
]);

export function makeEditor(parent, code, onChange) {
  return new EditorView({
    parent,
    state: EditorState.create({
      doc: code,
      extensions: [
        java(), lineNumbers(), history(), drawSelection(), highlightActiveLine(),
        indentOnInput(), bracketMatching(), indentUnit.of('    '), EditorState.tabSize.of(4),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        syntaxHighlighting(colors), placeholder('Write your Java method'),
        EditorView.contentAttributes.of({ 'aria-label': 'Java code editor', spellcheck: 'false' }),
        EditorView.lineWrapping,
        EditorView.updateListener.of(update => { if (update.docChanged) onChange(update.state.doc.toString()); })
      ]
    })
  });
}
