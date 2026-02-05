import { describe, it, expect } from 'vitest';
import {
  Button,
  Input,
  Card,
  Toggle,
  Toast,
  Spinner,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type InputProps,
  type CardProps,
  type ToggleProps,
  type ToggleOption,
  type ToastProps,
  type ToastVariant,
  type SpinnerProps,
  type SpinnerSize,
} from './index';

describe('UI Components Barrel Export', () => {
  it('should export all component functions', () => {
    expect(Button).toBeDefined();
    expect(typeof Button).toBe('function');

    expect(Input).toBeDefined();
    expect(typeof Input).toBe('function');

    expect(Card).toBeDefined();
    expect(typeof Card).toBe('function');

    expect(Toggle).toBeDefined();
    expect(typeof Toggle).toBe('function');

    expect(Toast).toBeDefined();
    expect(typeof Toast).toBe('function');

    expect(Spinner).toBeDefined();
    expect(typeof Spinner).toBe('function');
  });

  it('should export all TypeScript types without errors', () => {
    // This test verifies that all types can be imported
    // TypeScript compilation will fail if types are not exported correctly
    const buttonProps: ButtonProps = {
      children: 'Test',
    };
    expect(buttonProps).toBeDefined();

    const buttonVariant: ButtonVariant = 'primary';
    expect(buttonVariant).toBeDefined();

    const buttonSize: ButtonSize = 'md';
    expect(buttonSize).toBeDefined();

    const inputProps: InputProps = {};
    expect(inputProps).toBeDefined();

    const cardProps: CardProps = {
      children: null,
    };
    expect(cardProps).toBeDefined();

    const toggleOption: ToggleOption = {
      value: 'test',
      label: 'Test',
    };
    expect(toggleOption).toBeDefined();

    const toggleProps: ToggleProps = {
      options: [toggleOption, toggleOption],
      value: 'test',
      onChange: () => {},
    };
    expect(toggleProps).toBeDefined();

    const toastVariant: ToastVariant = 'success';
    expect(toastVariant).toBeDefined();

    const toastProps: ToastProps = {
      variant: 'success',
      message: 'Test',
      onDismiss: () => {},
    };
    expect(toastProps).toBeDefined();

    const spinnerSize: SpinnerSize = 'md';
    expect(spinnerSize).toBeDefined();

    const spinnerProps: SpinnerProps = {};
    expect(spinnerProps).toBeDefined();
  });

  it('should allow destructured imports from @/components/ui', () => {
    // This test verifies the import pattern works
    // If barrel export is broken, this test will fail at compile time
    const components = {
      Button,
      Input,
      Card,
      Toggle,
      Toast,
      Spinner,
    };

    expect(Object.keys(components)).toHaveLength(6);
    expect(components.Button).toBe(Button);
    expect(components.Input).toBe(Input);
    expect(components.Card).toBe(Card);
    expect(components.Toggle).toBe(Toggle);
    expect(components.Toast).toBe(Toast);
    expect(components.Spinner).toBe(Spinner);
  });
});
