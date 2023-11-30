import * as React from 'react'
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

import {
  Field,
  FieldProperties,
  Settings
} from './types';
import Editor from './components/Editor';

import './assets/css/main.css'

interface Props {
  path: string;
  active: FieldProperties | null;
  setActive: (val: FieldProperties | null) => void;
  selected: Field | null;
  clearSelect: () => void;
  settings: Settings;
  setSettings: (val: Settings) => void;
  fieldsets: FieldProperties[];
  setFieldsets: (val: FieldProperties[]) => void;
  templates?: FieldProperties[];
  generate: Boolean;
  clearGenerate:() => void;
}

function getFontName(font: string | undefined): StandardFonts {
  switch (font) {
    case 'Courier': return StandardFonts.Courier;
    case 'CourierBold': return StandardFonts.CourierBold;
    case 'Helvetica': return StandardFonts.Helvetica;
    case 'HelveticaBold': return StandardFonts.HelveticaBold;
    case 'TimesRoman': return StandardFonts.TimesRoman;
    case 'TimesRomanBold': return StandardFonts.TimesRomanBold;
    default: return StandardFonts.Helvetica;
  }
}

function hexToRgb(hex: string) {
  // Remove the '#' character if present
  hex = hex.replace(/^#/, '');

  // Parse the red (RR), green (GG), and blue (BB) components
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  // Return the RGB value using pdf-lib's rgb() function
  return rgb(r, g, b);
}

export const PDFEditor: React.FC<Props> = (props: Props) => {

  const handleActiveChange = (field: FieldProperties | null) => {
    console.log('active changed', field);

    props.setActive(field)
  }

  const handleUpdateFieldSets = (field: FieldProperties) => {
    console.log('field item changed', field);

    const updated = props.fieldsets.map((item: FieldProperties) => {
      if (item._id === field._id) {
        return field;
      }
      return item;
    });

    props.setFieldsets(updated);
  }

  const handleAddNewField = (field: FieldProperties) => {
    console.log('add new field', field);

    const updated = [ ...props.fieldsets, field ];
    props.setFieldsets(updated)
  }

  const handleRemoveField = (id: string) => {
    console.log('remove field', id);
    const updated = props.fieldsets.filter((item: FieldProperties) => item._id !== id);
    props.setFieldsets(updated);
  }

  const handleClearSelected = () => {
    props.clearSelect()
  }

  const handleTPageChange = (page: number) => {
    props.setSettings({
      ...props.settings,
      totalPage: page
    })
  }

  const handleFileGenerate = async() => {
    if(!props.fieldsets.length) return

    const existingPdfBytes = await fetch(props.path).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();

    for (const annotation of props.fieldsets) {
      let { height } = pages[annotation.page - 1].getSize();
      let data = annotation.data;

      // font
      let customFont = await pdfDoc.embedFont(getFontName(annotation.font?.family));
      let textSize = annotation.font?.size || 14;
      let textWidth = customFont.widthOfTextAtSize(data.toString(), textSize);
      let textHeight = customFont.heightAtSize(textSize);

      // position
      let x = annotation.position?.x || 0;
      let y = annotation.position?.y || 0;

      // container
      let w = annotation.container?.width || textWidth + 12;
      let h = annotation.container?.height || textHeight + 12;
      let border = annotation.container?.border ? hexToRgb(annotation.container.border) : undefined;
      let background = annotation.container?.background ? hexToRgb(annotation.container.background) : undefined;
      let opacity = annotation.container?.opacity ? annotation.container.opacity / 100 : 1;

      switch (annotation.type.icon) {
        case 'image':

          const jpgImageBytes = await fetch(annotation.data as string).then(res => res.arrayBuffer())

          if (annotation.ext === 'png') {
            // Draw container
            if(border || background)
              pages[annotation.page - 1].drawRectangle({
                x: x,
                y: height - y - h,
                width: w,
                height: h,
                borderWidth: 1,
                opacity: opacity,
                borderOpacity: opacity,
                color: background,
                borderColor: border,
              });

            const img = await pdfDoc.embedPng(jpgImageBytes);

            // Draw image
            pages[annotation.page - 1].drawImage(img, {
              x: x + 6,
              y: height - y - h + 6,
              width: w - 12,
              height: h - 12,
            });
          }
          if(annotation.ext?.toLowerCase() === 'jpg') {
            // Draw container
            if(border || background)
              pages[annotation.page - 1].drawRectangle({
                x: x,
                y: height - y - h,
                width: w,
                height: h,
                borderWidth: 1,
                opacity: opacity,
                borderOpacity: opacity,
                color: background,
                borderColor: border,
              });

            const img = await pdfDoc.embedJpg(jpgImageBytes);

            // Draw image
            pages[annotation.page - 1].drawImage(img, {
              x: x + 5,
              y: height - y - h + 6,
              width: w - 12,
              height: h - 12,
            });
          }
          break;

        case 'choice':
          // Handle choice type (if needed)
          let choice_w = annotation.container?.width;
          if(!choice_w) {
            let maximum = 0;
            (annotation.data as any[]).map((choice: any) => {
              maximum = (maximum > customFont.widthOfTextAtSize(choice.title, textSize)) ? maximum: customFont.widthOfTextAtSize(choice.title, textSize);
            })
            choice_w = maximum + 36
          }
          let choice_h = annotation.container?.height;
          if(!choice_h) {
            choice_h = (textHeight + 8) * annotation.data.length + 8
          }

          if(border || background)
            pages[annotation.page - 1].drawRectangle({
              x: x,
              y: height - y,
              width: choice_w,
              height: - choice_h,
              borderWidth: 1,
              opacity: opacity,
              borderOpacity: opacity,
              color: background,
              borderColor: border,
            });

          (annotation.data as string[]).map((choice: any, index: number) => {
            // add check box
            pages[annotation.page - 1].drawSquare({
              x: x + 5 + 0.1 * textHeight,
              y: height - y - (index * 1.57 + 0.5) * textHeight - 18,
              size: 16,
              borderWidth: 1,
              borderColor: rgb(0.84, 0.84, 0.84),
              color: rgb(1, 1, 1)
            })
            // add text
            pages[annotation.page - 1].drawText(choice.title, {
              x: x + 30,
              y: height - y - (index * 1.57 + 1) * textHeight - 5,
              font: customFont,
              size: textSize,
              opacity: opacity,
            })
          });
          break;

        default:
          // Draw container
          if(border || background)
            pages[annotation.page - 1].drawRectangle({
              x: x + 1,
              y: height - y - (h > textHeight ? h : textHeight + 12),
              width: w,
              height: h,
              borderWidth: 1,
              opacity: opacity,
              borderOpacity: opacity,
              borderColor: border,
              color: background,
            });

          // Draw text
          pages[annotation.page - 1].drawText(annotation.data.toString(), {
            x: x + 5,
            y: height - y - textHeight - 6,
            font: customFont,
            size: textSize,
            opacity: opacity,
          });
          break;
      }
    }

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const savedPath = window.URL.createObjectURL(blob);

    // Create a temporary <a> element to trigger the download
    const a = document.createElement('a');
    a.href = savedPath;
    a.download = 'generated-file.pdf'; // Specify the desired file name
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(savedPath);
    document.body.removeChild(a);
  }

  React.useEffect(() => {
    console.log('active changed: ', props.active)
  }, [props.active])

  React.useEffect(() => {
    console.log('selected item changed: ', props.selected)
  }, [props.selected])

  React.useEffect(() => {
    console.log('setting changed: ', props.settings)
  }, [props.settings])

  React.useEffect(() => {
    console.log('setting changed: ', props.fieldsets)
  }, [props.fieldsets])

  React.useEffect(() => {
    if(props.generate) {
      handleFileGenerate()
      props.clearGenerate()
    }
  }, [props.generate])

  return (
    <DndProvider backend={HTML5Backend}>
      <Editor
        source={props.path}
        active={props.active}
        selected={props.selected}
        settings={props.settings}
        fieldsets={props.fieldsets}
        templates={props.templates}
        onClearSelected={handleClearSelected}
        onActiveChange={handleActiveChange}
        onAddNewField={handleAddNewField}
        onUpdateFields={handleUpdateFieldSets}
        onRemoveField={handleRemoveField}
        onSuccessLoad={handleTPageChange} />
    </DndProvider>
  )
}
