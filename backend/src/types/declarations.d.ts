declare module 'swagger-ui-react' {
  import * as React from 'react';
  interface SwaggerUIProps {
    spec?: Record<string, any>;
    url?: string;
    deepLinking?: boolean;
    displayRequestDuration?: boolean;
    docExpansion?: 'list' | 'full' | 'none';
    filter?: boolean | string;
    [key: string]: any;
  }
  const SwaggerUI: React.ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}

declare module 'swagger-jsdoc' {
  interface Options {
    definition?: Record<string, any>;
    swaggerDefinition?: Record<string, any>;
    apis?: string[];
  }
  function swaggerJSDoc(options: Options): any;
  export default swaggerJSDoc;
}
