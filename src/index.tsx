import * as React from 'react'
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

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
  setGenerate:(fields: FieldProperties[], pdf_path: string) => void;
  templates?: FieldProperties[];
  generate: Boolean;
  clearGenerate:() => void;
}
/*
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
*/
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
    props.setGenerate(props.fieldsets, props.path);
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
