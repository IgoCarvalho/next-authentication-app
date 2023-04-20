import { ChangeEvent, FormEvent, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const { signIn } = useAuth();

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((oldForm) => ({ ...oldForm, [name]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    await signIn(form);
  }

  return (
    <main className="w-full min-h-screen flex justify-center items-center">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          className="bg-gray-800 px-3 py-2 rounded text-gray-100 border border-gray-700"
          type="email"
          name="email"
          placeholder="Seu e-mail"
          value={form.email}
          onChange={handleInputChange}
        />
        <input
          className="bg-gray-800 px-3 py-2 rounded text-gray-100 border border-gray-700"
          type="password"
          name="password"
          placeholder="********"
          value={form.password}
          onChange={handleInputChange}
        />

        <button
          type="submit"
          className="bg-teal-600 px-3 py-2 rounded text-sm font-semibold hover:bg-teal-500"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
