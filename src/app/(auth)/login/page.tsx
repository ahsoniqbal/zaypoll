import { googleLogin, sendMagicLink } from "@/actions/auth.action";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

                <h1 className="text-2xl font-semibold text-center mb-6">
                    Hey, time to Sign In 👋
                </h1>

                {/* Google Login */}
                <form action={googleLogin} className="mb-4">
                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
                    >
                        Continue with Google
                    </button>
                </form>

                <div className="flex items-center my-4">
                    <div className="flex-grow h-px bg-gray-300" />
                    <span className="px-2 text-sm text-gray-500">OR</span>
                    <div className="flex-grow h-px bg-gray-300" />
                </div>

                {/* ✅ Magic Link Form */}
                <form action={sendMagicLink} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        required
                        className="w-full px-3 py-2 border rounded-lg"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        className="w-full px-3 py-2 border rounded-lg"
                    />

                    <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Send Magic Link
                    </button>
                </form>
            </div>
        </div>
    );
}