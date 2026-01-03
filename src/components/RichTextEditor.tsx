"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { TextAlign } from '@tiptap/extension-text-align';
import { StarterKit } from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Link as LinkIcon, 
  Image as ImageIcon,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Youtube as YoutubeIcon,
  Upload,
  Maximize,
  Minimize
} from 'lucide-react';

// Extensão customizada para suportar largura na imagem
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => ({
          width: attributes.width,
          style: `width: ${attributes.width}; max-width: 100%; height: auto;`,
        }),
      },
    }
  },
})

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL da imagem:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const uploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const content = readerEvent.target?.result as string;
          editor.chain().focus().setImage({ src: content }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const resizeImage = (width: string) => {
    editor.chain().focus().updateAttributes('image', { width }).run();
  };

  const addYoutubeVideo = () => {
    const url = window.prompt('URL do vídeo do YouTube:');

    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL do link:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50 sticky top-0 z-10">
      <div className="flex items-center gap-1 pr-2 border-r">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive('bold') ? 'bg-muted text-primary' : ''}`}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive('italic') ? 'bg-muted text-primary' : ''}`}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive('underline') ? 'bg-muted text-primary' : ''}`}
          title="Sublinhado"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-muted text-primary' : ''}`}
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-muted text-primary' : ''}`}
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-muted text-primary' : ''}`}
          title="Título 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive('paragraph') ? 'bg-muted text-primary' : ''}`}
          title="Texto Normal"
        >
          <Type className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-muted text-primary' : ''}`}
          title="Alinhar à Esquerda"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-muted text-primary' : ''}`}
          title="Centralizar"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-muted text-primary' : ''}`}
          title="Alinhar à Direita"
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive('bulletList') ? 'bg-muted text-primary' : ''}`}
          title="Lista de Marcadores"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive('orderedList') ? 'bg-muted text-primary' : ''}`}
          title="Lista Numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r">
        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded hover:bg-muted transition-colors ${editor.isActive('link') ? 'bg-muted text-primary' : ''}`}
          title="Adicionar Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-muted transition-colors"
          title="Adicionar Imagem por URL"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={uploadImage}
          className="p-2 rounded hover:bg-muted transition-colors"
          title="Fazer Upload de Imagem"
        >
          <Upload className="h-4 w-4" />
        </button>
        
        {editor.isActive('image') && (
          <>
            <button
              type="button"
              onClick={() => resizeImage('25%')}
              className="p-2 rounded hover:bg-muted transition-colors text-xs font-bold"
              title="Imagem Pequena (25%)"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() => resizeImage('50%')}
              className="p-2 rounded hover:bg-muted transition-colors text-xs font-bold"
              title="Imagem Média (50%)"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => resizeImage('100%')}
              className="p-2 rounded hover:bg-muted transition-colors text-xs font-bold"
              title="Imagem Grande (100%)"
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => {
                const width = window.prompt('Largura da imagem (ex: 300px ou 50%):');
                if (width) resizeImage(width);
              }}
              className="p-2 rounded hover:bg-muted transition-colors text-xs font-bold"
              title="Largura Personalizada"
            >
              PX/%
            </button>
          </>
        )}

        <button
          type="button"
          onClick={addYoutubeVideo}
          className="p-2 rounded hover:bg-muted transition-colors"
          title="Adicionar Vídeo do YouTube"
        >
          <YoutubeIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 pl-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-muted disabled:opacity-50 transition-colors"
          title="Desfazer"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-muted disabled:opacity-50 transition-colors"
          title="Refazer"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      CustomImage.configure({
        allowBase64: true,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: placeholder || 'Comece a escrever...',
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-4 max-w-none',
      },
    },
  });

  // Atualiza o conteúdo do editor se o prop content mudar externamente (ex: reset do form)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border rounded-lg bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
