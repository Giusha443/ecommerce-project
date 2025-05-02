import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiRoot, createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { AuthMiddlewareOptions, Client, ClientBuilder, HttpMiddlewareOptions } from '@commercetools/sdk-client-v2';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  readonly projectKey = import.meta.env.NG_APP_CTP_PROJECT_KEY;
  private apiRoot!: ApiRoot;

  constructor(private http: HttpClient) {
    this.initializeClient();
  }

  private initializeClient() {
    const authMiddlewareOptions: AuthMiddlewareOptions = {
      host: import.meta.env.NG_APP_CTP_AUTH_URL,
      projectKey: this.projectKey,
      credentials: {
        clientId: import.meta.env.NG_APP_CTP_CLIENT_ID,
        clientSecret: import.meta.env.NG_APP_CTP_CLIENT_SECRET,
      },
      scopes: [`manage_project:${this.projectKey}`],
      fetch: this.angularFetch.bind(this),
    };

    const httpMiddlewareOptions: HttpMiddlewareOptions = {
      host: import.meta.env.NG_APP_CTP_API_URL,
      fetch: this.angularFetch.bind(this),
    };

    const client: Client = new ClientBuilder()
      .withProjectKey(this.projectKey)
      .withClientCredentialsFlow(authMiddlewareOptions)
      .withHttpMiddleware(httpMiddlewareOptions)
      .withLoggerMiddleware()
      .build();

    this.apiRoot = createApiBuilderFromCtpClient(client);
  }

  private async angularFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const response = await this.http
      .request(init?.method || 'GET', input.toString(), {
        headers: init?.headers as any,
        body: init?.body as any,
      })
      .toPromise();
    return new Response(JSON.stringify(response));
  }

  getApiRoot(): ApiRoot {
    return this.apiRoot;
  }
}
