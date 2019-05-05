import { initTracer as initJaegerClientTracer } from 'jaeger-client';
import { FORMAT_HTTP_HEADERS, Span, SpanContext, Tracer } from 'opentracing';
import { Logger } from '../logger/logger.types';
import { ServiceTracingConfig } from '../app/tracing.config';

export interface TracingId {
  [key: string]: string;
}

export interface TracingTags {
  [key: string]: any;
}

export class CallTracer {
  constructor(private tracer: Tracer) {}

  public async traceCall(
    name: string,
    call: (span: Span) => void | Promise<any>,
    tags?: TracingTags,
    childOf?: Span | SpanContext
  ) {
    const span = this.tracer.startSpan(name, { childOf, tags });

    const response = await call(span);

    span.finish();

    return response;
  }

  public tracingIdToString(span: Span): string {
    const headers = {};

    this.tracer.inject(span, FORMAT_HTTP_HEADERS, headers);

    return JSON.stringify(headers);
  }

  public tracingIdFromString(tracingIdString: string): SpanContext | undefined {
    return this.tracer.extract(FORMAT_HTTP_HEADERS, JSON.parse(tracingIdString)) || undefined;
  }
}

export const initTracer = (options: ServiceTracingConfig, logger?: Logger): CallTracer =>
  new CallTracer(
    initJaegerClientTracer(
      {
        serviceName: options.appName,
        sampler: {
          type: 'const',
          param: 1,
        },
        reporter: {
          logSpans: true,
          agentHost: options.tracingServiceHost,
          agentPort: options.tracingServicePort,
        },
      },
      { logger }
    )
  );
