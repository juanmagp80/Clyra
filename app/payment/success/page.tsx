export default function PaymentSuccessPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
			<div className="bg-white rounded-2xl shadow-xl p-8 text-center">
				<h1 className="text-3xl font-bold text-green-700 mb-4">¡Pago realizado con éxito!</h1>
				<p className="text-green-800 mb-6">Tu suscripción ha sido activada correctamente.</p>
				<a href="/dashboard" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">Ir al Dashboard</a>
			</div>
		</div>
	);
}
