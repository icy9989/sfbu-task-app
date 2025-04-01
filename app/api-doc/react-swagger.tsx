'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
  spec: Record<string, unknown>; // Accept any object with string keys
};

function ReactSwagger({ spec }: Props) {
  // Make sure spec is valid (in case you want to add extra validation or fallback)
  if (!spec || typeof spec !== 'object') {
    return <div>Error: Swagger specification is invalid or missing.</div>;
  }

  return <SwaggerUI spec={spec} />;
}

export default ReactSwagger;
