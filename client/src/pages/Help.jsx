import { useState } from 'react';
import { HelpCircle, ChevronDown, MessageCircle, Mail, Phone } from 'lucide-react';

const faqs = [
  {
    question: '¿Cómo hago un pedido?',
    answer:
      'Busca la pulpería que desees, agrega productos al carrito y procede al checkout. Puedes hacer pedidos de múltiples pulperías al mismo tiempo.',
  },
  {
    question: '¿Cómo sé cuándo está listo mi pedido?',
    answer:
      'Recibirás notificaciones en tiempo real cuando tu pedido cambie de estado. También puedes ver el estado en la sección "Mis Pedidos".',
  },
  {
    question: '¿Puedo cancelar un pedido?',
    answer:
      'Puedes cancelar un pedido mientras esté en estado "Pendiente". Una vez que la pulpería lo acepte, ya no es posible cancelarlo.',
  },
  {
    question: '¿Cómo funciona el programa de lealtad?',
    answer:
      'Algunas pulperías ofrecen programas de lealtad. Acumulas puntos con cada compra y puedes canjearlos por descuentos o productos gratis.',
  },
  {
    question: '¿Cómo me convierto en pulpería?',
    answer:
      'Puedes registrarte como pulpería desde la pantalla de registro. Necesitarás proporcionar información de tu negocio y ubicación.',
  },
  {
    question: '¿Qué hago si hay un problema con mi pedido?',
    answer:
      'Contacta directamente a la pulpería a través de WhatsApp. También puedes dejar una reseña describiendo tu experiencia.',
  },
];

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayuda</h1>
        <p className="text-gray-500 mt-1">Preguntas frecuentes y soporte</p>
      </div>

      {/* FAQs */}
      <div className="card divide-y divide-gray-100">
        {faqs.map((faq, index) => (
          <div key={index} className="p-4">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="font-medium text-gray-900">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>

      {/* Contacto */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">¿Necesitas más ayuda?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <a
            href="https://wa.me/50499999999"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 flex items-center gap-3 hover:border-green-500 transition-colors"
          >
            <div className="p-2 bg-green-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">WhatsApp</h3>
              <p className="text-sm text-gray-500">Respuesta inmediata</p>
            </div>
          </a>

          <a
            href="mailto:soporte@lapulperiahn.shop"
            className="card p-4 flex items-center gap-3 hover:border-primary-500 transition-colors"
          >
            <div className="p-2 bg-primary-50 rounded-lg">
              <Mail className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Correo electrónico</h3>
              <p className="text-sm text-gray-500">soporte@lapulperiahn.shop</p>
            </div>
          </a>
        </div>
      </div>

      {/* Info adicional */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
        <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800">
            <strong>Horario de atención:</strong> Lunes a Sábado, 8:00 AM - 6:00 PM
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Para emergencias fuera de horario, contacta por WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;
