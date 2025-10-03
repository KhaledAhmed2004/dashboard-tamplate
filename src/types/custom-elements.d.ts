// Allow use of the custom Trix editor element in JSX
import type * as React from 'react';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'trix-editor': any;
      }
    }
  }
}