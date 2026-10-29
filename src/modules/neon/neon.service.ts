import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { createRealtime, rawSql } from '@neon/realtime/server';

@Injectable()
export class NeonService {
  private readonly logger = new Logger(NeonService.name);
  private s3Client: S3Client | null = null;

  constructor(private readonly dataSource: DataSource) {
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.s3Client = new S3Client({
        forcePathStyle: true,
        endpoint: process.env.AWS_ENDPOINT_URL_S3,
        region: process.env.AWS_REGION || 'us-east-2',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  /**
   * Test Lakebase Postgres connection
   */
  async testPostgres() {
    const result = await this.dataSource.query(
      'SELECT current_database() as db, current_setting($1, true) as tenant_id, count(*)::int as user_count FROM users',
      ['app.tenant_id'],
    );
    return {
      status: 'ok',
      service: 'postgres',
      database: result[0]?.db,
      tenantId: result[0]?.tenant_id,
      userCount: result[0]?.user_count,
    };
  }

  /**
   * Test Neon Auth by checking the JWKS endpoint
   */
  async testAuth() {
    const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
    const baseUrl = process.env.NEON_AUTH_BASE_URL;

    if (!jwksUrl) {
      throw new Error('NEON_AUTH_JWKS_URL is not set.');
    }

    const res = await fetch(jwksUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch JWKS: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as { keys?: unknown[] };

    return {
      status: 'ok',
      service: 'auth',
      baseUrl,
      jwksUrl,
      keysCount: Array.isArray(data.keys) ? data.keys.length : 0,
    };
  }

  /**
   * Test Neon Object Storage (S3 bucket)
   */
  async testObjectStorage() {
    if (!this.s3Client) {
      throw new Error('AWS credentials for Object Storage are not configured.');
    }

    const bucket = 'assets';
    const testKey = `health-check-${Date.now()}.txt`;
    const content = 'Neon Object Storage test payload';

    // 1. Put Object
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: testKey,
        Body: content,
        ContentType: 'text/plain',
      }),
    );

    // 2. Get Object
    const getRes = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: testKey,
      }),
    );
    const readBody = await getRes.Body?.transformToString();

    // 3. List Objects
    const listRes = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        MaxKeys: 5,
      }),
    );

    // 4. Delete Object (cleanup)
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: testKey,
      }),
    );

    return {
      status: 'ok',
      service: 'object-storage',
      bucket,
      verifiedContent: readBody === content,
      totalKeysListed: listRes.KeyCount ?? 0,
    };
  }

  /**
   * Test Neon Functions (invoking deployed hello function)
   */
  async testFunctions() {
    const functionUrl = process.env.NEON_FUNCTION_HELLO_BASE_URL;
    if (!functionUrl) {
      throw new Error('NEON_FUNCTION_HELLO_BASE_URL is not set.');
    }

    const res = await fetch(functionUrl);
    if (!res.ok) {
      throw new Error(`Failed to invoke Neon Function: ${res.status} ${res.statusText}`);
    }
    const text = await res.text();

    return {
      status: 'ok',
      service: 'functions',
      functionUrl,
      response: text.trim(),
    };
  }

  /**
   * Test Neon Realtime (sealing live queries)
   */
  async testRealtime() {
    const secret = process.env.NEON_REALTIME_SECRET;
    const url = process.env.NEON_REALTIME_URL;

    if (!secret || !url) {
      throw new Error('NEON_REALTIME_SECRET or NEON_REALTIME_URL is not set.');
    }

    const realtime = createRealtime({
      secret,
      url,
      db: 'neondb',
    });

    const query = rawSql<{ id: string; name: string }>(
      'SELECT id, name FROM public.categories LIMIT 10',
      [],
    );
    const sealed = await realtime.seal({ query });

    return {
      status: 'ok',
      service: 'realtime',
      url,
      sealedQueryPresent: typeof sealed.capability === 'string' && sealed.capability.length > 0,
      queryFingerprint: sealed.queryFingerprint,
      expiresAt: sealed.expiresAt,
    };
  }

  /**
   * Comprehensive end-to-end status of all 5 Neon services
   */
  async testAllServices() {
    const [postgres, auth, objectStorage, functions, realtime] = await Promise.all([
      this.testPostgres().catch((e: Error) => ({ status: 'error', service: 'postgres', error: e.message })),
      this.testAuth().catch((e: Error) => ({ status: 'error', service: 'auth', error: e.message })),
      this.testObjectStorage().catch((e: Error) => ({ status: 'error', service: 'object-storage', error: e.message })),
      this.testFunctions().catch((e: Error) => ({ status: 'error', service: 'functions', error: e.message })),
      this.testRealtime().catch((e: Error) => ({ status: 'error', service: 'realtime', error: e.message })),
    ]);

    return {
      timestamp: new Date().toISOString(),
      branch: process.env.NEON_BRANCH,
      services: {
        postgres,
        auth,
        objectStorage,
        functions,
        realtime,
      },
    };
  }
}
