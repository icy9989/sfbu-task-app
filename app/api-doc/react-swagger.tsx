'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
  spec: Record<string, unknown>; // Accept any object with string keys
};

function ReactSwagger({ spec }: Props) {
  // Ensure spec is valid
  if (!spec || typeof spec !== 'object') {
    return <div>Error: Swagger specification is invalid or missing.</div>;
  }

  // Render Swagger UI with the spec
  return <SwaggerUI spec={spec} />;
}

export default ReactSwagger;
