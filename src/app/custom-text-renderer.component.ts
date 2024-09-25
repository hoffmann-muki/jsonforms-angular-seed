import { Component, OnInit, OnDestroy } from '@angular/core';
import { JsonFormsAngularService } from '@jsonforms/angular';
import { FormControl } from '@angular/forms';
import { getData, ControlElement, JsonSchema, Actions, RankedTester, rankWith, isControl } from '@jsonforms/core';
import { TextControlRenderer } from '@jsonforms/angular-material';

@Component({
  selector: 'app-custom-text-renderer',
  template: `
    <mat-form-field [ngStyle]="{ display: hidden ? 'none' : '' }" class="custom-text-form-field">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        [type]="getType()"
        (input)="onChange($event)"
        [id]="id"
        [formControl]="form"
        [placeholder]="placeholder"
        (focus)="focused = true"
        (focusout)="focused = false"
      />
      <mat-hint *ngIf="shouldShowUnfocusedDescription() || focused" class="custom-hint">
        {{ description }}
      </mat-hint>
      <mat-error class="custom-error">{{ error }}</mat-error>
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: row;
      }
      mat-form-field.custom-text-form-field {
        flex: 1 1 auto;
        background-color: #e3f2fd; /* Light blue background */
        border-radius: 8px; /* Rounded corners */
      }
      mat-label.custom-label {
        color: #1565c0; /* Custom label color */
        font-weight: bold;
      }
      input.matInput {
        color: #0d47a1; /* Custom input text color */
        font-size: 16px; /* Larger font size */
      }
      mat-hint.custom-hint {
        color: #0d47a1; /* Custom hint color */
      }
      mat-error.custom-error {
        color: #d32f2f; /* Custom error color */
      }
    `,
  ],
})
export class CustomTextRendererComponent extends TextControlRenderer implements OnInit, OnDestroy {
  form: FormControl = new FormControl();
  placeholder: string | undefined;
  focused: boolean = false;

  constructor(jsonFormsService: JsonFormsAngularService) {
    super(jsonFormsService);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const controlElement = this.uischema as ControlElement;
    const schema = this.schema as JsonSchema;

    console.log(this.data);

    // Extract label and placeholder from uischema and schema
    this.label = (controlElement.label || '') as string;

    // Subscribe to state changes to update formControl value
    this.subscription = this.jsonFormsService.$state.subscribe((state) => {
      const data = getData(state);
      console.log("Received:", data);
      if (data !== this.form.value) {
        this.form.setValue('something', { emitEvent: false });
      }

      // Handle validation errors
      const errors = state?.jsonforms?.core?.errors?.filter((error) => error.instancePath === this.path);
      if (errors.length > 0) {
        this.error = errors[0].message;
        this.form.setErrors({ custom: true });
      } else {
        this.error = '';
        this.form.setErrors(null);
      }
    });

    // Initialize formControl value using correct data path
    // this.form.setValue(getData(this.jsonFormsService.getState()));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  onChange(event: any): void {
    const value = event.target.value;
    this.jsonFormsService.updateCore(Actions.update(this.path, () => value));
  }
}

export const CustomTextRendererTester: RankedTester = rankWith(
  4, // Higher rank to take precedence over default renderers
  (uischema, _) => isControl(uischema) && (uischema.scope as string).endsWith('2')
);
