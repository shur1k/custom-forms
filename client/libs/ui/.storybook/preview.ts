import { applicationConfig, type Preview } from '@storybook/angular';
import { provideZonelessChangeDetection } from '@angular/core';

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [provideZonelessChangeDetection()],
    }),
  ],
};

export default preview;
