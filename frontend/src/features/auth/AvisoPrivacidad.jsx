const AvisoPrivacidad = ({ aceptado, onChange }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Aviso de privacidad</h3>
      <div
        className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-4 mb-4 text-sm text-gray-700 leading-relaxed bg-gray-50"
        tabIndex={0}
        role="region"
        aria-label="Aviso de privacidad"
      >
        <p className="mb-3">
          Este proyecto de tesis de la Facultad de Telemática de la Universidad de Colima recopila
          los siguientes datos con fines exclusivamente académicos:
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>Correo institucional (para identificar participantes únicos).</li>
          <li>Respuestas al cuestionario de huella ecológica y a la encuesta de evaluación.</li>
          <li>Tiempo aproximado de uso de la calculadora.</li>
        </ul>
        <p className="mb-3">
          Tu correo se almacena de forma pseudonimizada en el servidor; tu nombre y número de cuenta
          no se registran. Los datos se usan solo para el análisis estadístico de esta investigación
          y no se comparten con terceros.
        </p>
        <p className="mb-3">
          Puedes dejar de participar en cualquier momento cerrando esta página. Si deseas ejercer
          tus derechos de acceso, rectificación, cancelación u oposición (derechos ARCO), contacta
          al responsable del proyecto en la Facultad de Telemática de la Universidad de Colima.
        </p>
        <p>
          Al marcar la casilla de abajo, confirmas que leíste este aviso y aceptas participar
          de manera voluntaria.
        </p>
      </div>
      <label className="flex items-start gap-3 cursor-pointer select-none group">
        <input
          type="checkbox"
          checked={aceptado}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-lime-600 focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 accent-lime-600"
        />
        <span className="text-sm text-gray-800 group-hover:text-gray-900">
          He leído el aviso de privacidad y acepto participar voluntariamente.
        </span>
      </label>
    </div>
  );
};

export default AvisoPrivacidad;
