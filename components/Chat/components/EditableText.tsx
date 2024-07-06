/** AUTO-SUMMARY **
   Purpose: This file defines a React component named `EditableText`, which provides a customizable text input field with features for editing, validation, and event handling.

   Key Components:
   - `EditableTextProps`: TypeScript interface defining the props for the `EditableText` component.
   - `EditableText`: Main React functional component that handles the editable text input logic.
   - Internal state management functions: `handleKeyDown`, `handleOnBlur`, `handleViewFocus`, `handleKeyDownForView`, `handleInputChange`, `handleCancel`, `handleActivateEditMode`, `handleSave`.
   - Rendering functions: `_renderInput`, `_renderEditingMode`, `_renderViewMode`.

   Functional Overview: The component allows users to interact with a text field that can switch between view and edit modes based on various triggers (e.g., focus, key presses). It supports validation, custom rendering, and event handling for saving or canceling edits. The component also provides visual feedback and additional UI elements like buttons depending on the state and props.

   Dependencies and Integrations: The component uses `@radix-ui/themes` for UI elements such as `Heading`, `IconButton`, and `TextField`. It integrates with React's state and effect hooks for managing component state and lifecycle.

   Additional Context: The component is highly customizable with numerous props to control its behavior, making it suitable for various use cases where inline editing of text is required. It also handles accessibility concerns with proper use of ARIA attributes and keyboard event handling.
*** END-SUMMARY **/
/* eslint-disable react/prop-types */
import { Heading, IconButton, TextField } from '@radix-ui/themes'
import React, { ChangeEvent, FocusEvent, KeyboardEvent, useEffect, useState } from 'react'


interface EditableTextProps {
  value?: string
  editing?: boolean
  submitOnEnter?: boolean
  cancelOnEscape?: boolean
  cancelOnUnfocus?: boolean
  submitOnUnfocus?: boolean
  startEditingOnFocus?: boolean
  startEditingOnEnter?: boolean
  editOnViewClick?: boolean
  saveButtonContent?: React.ReactNode
  cancelButtonContent?: React.ReactNode
  editButtonContent?: React.ReactNode
  validation?: (value: string) => boolean | Promise<boolean>
  onValidationFail?: (value: string) => void
  validationMessage?: string
  hint?: string
  renderValue?: (value: string) => React.ReactNode
  onSave: (value: string, inputProps?: React.InputHTMLAttributes<HTMLInputElement>) => void
  onCancel?: (value: string, inputProps?: React.InputHTMLAttributes<HTMLInputElement>) => void
  onEditingStart?: (value: string, inputProps?: React.InputHTMLAttributes<HTMLInputElement>) => void
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  viewProps?: React.HTMLAttributes<HTMLDivElement>
  containerProps?: React.HTMLAttributes<HTMLDivElement>
  tabIndex?: number
  showButtonsOnHover?: boolean
}

function EditableText(props: EditableTextProps) {
  // state
  const [editingInternal, setEditingInternal] = useState(props.editing)
  const [valid, setValid] = useState<boolean>(true)
  const [valueInternal, setValueInternal] = useState<string>(props.value || '')
  const [savedValue, setSavedValue] = useState<string>('')
  const [viewFocused, setViewFocused] = useState<boolean>(false)
  const editingButtons = React.createRef<HTMLDivElement>()

  useEffect(() => {
    if (props.value !== undefined) {
      setValueInternal(props.value)
      setSavedValue(props.value)
    }

    if (props.editing !== undefined) {
      setEditingInternal(props.editing)
    }
  }, [props.editing, props.value])

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    const isEnter = [13, 'Enter'].some((c) => e.key === c || e.code === c)
    const isEscape = [27, 'Escape', 'Esc'].some((c) => e.code === c || e.key === c)
    if (isEnter) {
      props.submitOnEnter && handleSave()
      e?.preventDefault()
    }
    if (isEscape) {
      props.cancelOnEscape && handleCancel()
      e.preventDefault()
    }
    props.inputProps?.onKeyDown && props.inputProps.onKeyDown(e)
  }

  function handleOnBlur(e: FocusEvent<HTMLInputElement>): void {
    const isEditingButton = editingButtons.current?.contains(e?.relatedTarget)
    props.cancelOnUnfocus && !isEditingButton && handleCancel()
    props.submitOnUnfocus && !isEditingButton && !props.cancelOnUnfocus && handleSave()
    props.inputProps?.onBlur && props.inputProps.onBlur(e)
  }

  function handleViewFocus(e: FocusEvent<HTMLInputElement>): void {
    setViewFocused(true)
    props.startEditingOnFocus && setEditingInternal(true)
    props.viewProps?.onFocus && props.viewProps.onFocus(e)
  }

  function handleKeyDownForView(e: KeyboardEvent<HTMLInputElement>): void {
    const isEnter = [13, 'Enter'].some((c) => e.key === c || e.code === c)
    const startEditing = isEnter && viewFocused && props.startEditingOnEnter
    startEditing && e.preventDefault()
    startEditing && setEditingInternal(true)
    props.viewProps?.onKeyDown && props.viewProps.onKeyDown(e)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>): void {
    setValid(true)
    setValueInternal(e.target.value)
    props.inputProps?.onChange?.(e as ChangeEvent<HTMLInputElement>)
  }

  function handleCancel(): void {
    const val = savedValue ?? props.value
    setValid(true)
    setEditingInternal(false)
    setValueInternal(val)
    props.onCancel?.(val, props.inputProps)
  }

  function handleActivateEditMode(): void {
    setEditingInternal(true)
    props.onEditingStart?.(valueInternal, props.inputProps)
  }

  async function handleSave(): Promise<void> {
    if (typeof props.validation === 'function') {
      const isValid = await props.validation(valueInternal)
      if (!isValid) {
        setValid(false)
        await props.onValidationFail?.(valueInternal)
        return
      }
    }
    setEditingInternal(false)
    setSavedValue(valueInternal)
    props.onSave(valueInternal, props.inputProps)
  }

  function _renderInput() {
    return (
      <TextField.Input
        radius="full"
        variant="surface"
        placeholder="Name the chat..."
        size="3"
        tabIndex={0}
        value={valueInternal}
        onKeyDown={handleKeyDown}
        onBlur={handleOnBlur}
        onChange={handleInputChange}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={editingInternal}
      />
    )
  }

  function _renderEditingMode() {
    const inputElem = _renderInput()

    return (
      <div>
        <TextField.Root>
          {inputElem}
          <TextField.Slot>
            <IconButton size="3" variant="ghost" onClick={handleSave}>
              {props.saveButtonContent}
            </IconButton>
          </TextField.Slot>
          <TextField.Slot className="pr-4">
            <IconButton size="3" variant="ghost" onClick={handleCancel}>
              {props.cancelButtonContent}
            </IconButton>
          </TextField.Slot>
        </TextField.Root>
        {!valid && !props.onValidationFail && <div className={''}>{props.validationMessage}</div>}
        {props.hint && <div className={''}>{props.hint}</div>}
      </div>
    )
  }

  function _renderViewMode() {
    const viewClickHandler = props.editOnViewClick ? handleActivateEditMode : undefined
    const _value =
      typeof props.renderValue === 'function' ? props.renderValue(valueInternal) : valueInternal
    return (
      <TextField.Root className={`group ${props.viewProps?.className || ''}`}>
        <Heading
          size="5"
          m="2"
          highContrast={true}
          tabIndex={props.tabIndex}
          // {...props.viewProps}
          onKeyDown={handleKeyDownForView}
          onFocus={handleViewFocus}
          onClick={viewClickHandler}
        >
          {_value}
        </Heading>
        <TextField.Slot
          className={props.showButtonsOnHover ? 'invisible group-hover:visible' : 'invisible'}
        >
          <IconButton size="3" variant="ghost" highContrast={true} onClick={handleActivateEditMode}>
            {props.editButtonContent}
          </IconButton>
        </TextField.Slot>
      </TextField.Root>
    )
  }

  const mode = editingInternal ? _renderEditingMode() : _renderViewMode()
  return (
    <div className="h-10" {...props.containerProps}>
      {mode}
    </div>
  )
}

export default EditableText
