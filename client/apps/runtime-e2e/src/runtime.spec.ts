import {
  expect,
  Page,
  request as playwrightRequest,
  test,
} from '@playwright/test';

const API = 'http://localhost:3000/api/v1';
const SEED_EMAIL = 'superuser@test.com';
const SEED_PASSWORD = '$uperUser_25';

interface CreatedSchema {
  id: string;
}

async function login(): Promise<string> {
  const api = await playwrightRequest.newContext();
  const res = await api.post(`${API}/auth/login`, {
    data: { email: SEED_EMAIL, password: SEED_PASSWORD },
  });
  const { accessToken } = await res.json();
  await api.dispose();
  return accessToken;
}

async function createPublishedSchema(
  token: string,
  title: string,
): Promise<string> {
  const api = await playwrightRequest.newContext({
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });
  const created: CreatedSchema = await (
    await api.post(`${API}/schemas`, {
      data: {
        title,
        type: 'form',
        schema: {
          type: 'object',
          required: ['name'],
          'x-actions': [
            {
              id: 'submit',
              label: 'Submit',
              col: 0,
              row: 4,
              w: 12,
              h: 4,
              disabled: false,
              textColor: '#000000',
            },
          ],
          properties: {
            name: {
              type: 'string',
              title: 'Name',
              'x-ui': {
                component: 'input',
                col: 0,
                row: 0,
                w: 12,
                h: 4,
                showTitle: true,
                disabled: false,
                textColor: '#000000',
              },
            },
          },
        },
      },
    })
  ).json();
  await api.post(`${API}/schemas/${created.id}/publish`);
  await api.dispose();
  return created.id;
}

async function authenticate(page: Page, token: string): Promise<void> {
  await page.goto('/');
  await page.evaluate((t) => localStorage.setItem('accessToken', t), token);
}

test.describe('Runtime — fill, submit, and return to a published form', () => {
  test('happy path: discover, fill, submit, and see the same values on return (AC-17/AC-19/AC-30)', async ({
    page,
  }) => {
    const token = await login();
    const schemaId = await createPublishedSchema(
      token,
      `E2E Happy Path ${Date.now()}`,
    );

    await authenticate(page, token);
    await page.goto('/runtime');

    await page.getByRole('button', { name: 'Open' }).first().click();
    await expect(page).toHaveURL(/\/runtime\/form-viewer\//);

    await page.getByLabel('Name').fill('Alice');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Submitted')).toBeVisible();

    await page.goto(`/runtime/form-viewer/${schemaId}`);
    await expect(page.getByLabel('Name')).toHaveValue('Alice');
  });

  test('blocks an invalid submit and shows a field error (AC-18)', async ({
    page,
  }) => {
    const token = await login();
    const schemaId = await createPublishedSchema(
      token,
      `E2E Validation ${Date.now()}`,
    );

    await authenticate(page, token);
    await page.goto(`/runtime/form-viewer/${schemaId}`);

    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('This field is required')).toBeVisible();
    await expect(page).toHaveURL(
      new RegExp(`/runtime/form-viewer/${schemaId}`),
    );
  });

  test('hides an unpublished form from discovery and direct access (AC-14)', async ({
    page,
  }) => {
    const token = await login();
    const api = await playwrightRequest.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
    const draftTitle = `E2E Draft ${Date.now()}`;
    const created: CreatedSchema = await (
      await api.post(`${API}/schemas`, {
        data: { title: draftTitle, type: 'form' },
      })
    ).json();
    await api.dispose();

    await authenticate(page, token);
    await page.goto('/runtime');
    await expect(page.getByText(draftTitle)).not.toBeVisible();

    await page.goto(`/runtime/form-viewer/${created.id}`);
    await expect(page.getByText('not available')).toBeVisible();
  });
});
