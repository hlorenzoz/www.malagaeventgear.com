import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendEmail } from './resend';

const mockFetch = vi.fn();

afterEach(() => {
	vi.clearAllMocks();
});

describe('sendEmail', () => {
	it('POSTs to Resend API with correct headers and body', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ id: 'resend-msg-abc' }),
		});

		const result = await sendEmail(
			{
				to: 'ana@example.com',
				subject: 'Test Subject',
				html: '<p>Hello</p>',
				text: 'Hello',
			},
			're_test_key',
			'MEG <hola@malagaeventgear.com>',
			mockFetch,
		);

		expect(mockFetch).toHaveBeenCalledOnce();
		const [url, init] = mockFetch.mock.calls[0];
		expect(url).toBe('https://api.resend.com/emails');
		expect(init.method).toBe('POST');
		expect(init.headers['Authorization']).toBe('Bearer re_test_key');
		expect(init.headers['Content-Type']).toBe('application/json');

		const sentBody = JSON.parse(init.body as string);
		expect(sentBody.to).toBe('ana@example.com');
		expect(sentBody.subject).toBe('Test Subject');
		expect(sentBody.html).toBe('<p>Hello</p>');
		expect(sentBody.from).toBe('MEG <hola@malagaeventgear.com>');

		expect(result.id).toBe('resend-msg-abc');
	});

	it('throws a typed error on non-2xx response', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 422,
			json: async () => ({ message: 'Invalid from address' }),
		});

		await expect(
			sendEmail(
				{ to: 'x@x.com', subject: 'S', html: '<p>H</p>', text: 'H' },
				're_key',
				'from@x.com',
				mockFetch,
			),
		).rejects.toThrow('Resend error 422');
	});
});
