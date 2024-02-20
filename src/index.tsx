import * as React from 'react'
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
  templates: FieldProperties[];
  generate: Boolean;
  clearGenerate:() => void;
  pageButtonCnt: number;
  scale: number;
  onMouseChangeOnPage: (x: string, y: string) => void;
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

  const setCurrentPage = (index: number) => {
    props.setSettings({
      ...props.settings,
      currentPage: index
    })
  }

  const handleFileGenerate = async() => {
    if(!props.fieldsets.length) return
    props.setGenerate(props.templates.concat(props.fieldsets), props.path);
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
        scale={props.scale}
        fieldsets={props.fieldsets}
        templates={props.templates}
        pageButtonCnt={props.pageButtonCnt}
        onClearSelected={handleClearSelected}
        onActiveChange={handleActiveChange}
        onAddNewField={handleAddNewField}
        onUpdateFields={handleUpdateFieldSets}
        onRemoveField={handleRemoveField}
        onSuccessLoad={handleTPageChange} 
        onPageChange={setCurrentPage}
        onMouseChange={props.onMouseChangeOnPage}
        />
    </DndProvider>
  )
}
