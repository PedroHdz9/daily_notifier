import React, { useState, useEffect, useRef } from 'react';
import {
    Bell,
    Plus,
    Trash2,
    Clock,
    Wifi,
    Battery,
    Signal,
    X,
    Check,
    BellRing
} from 'lucide-react';

export default function App() {
    const [reminders, setReminders] = useState([
        { id: 1, title: 'Beber agua', time: '10:30', isActive: true, lastTriggered: null },
        { id: 2, title: 'Reunión de equipo', time: '16:00', isActive: false, lastTriggered: null }
    ]);

    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTime, setNewTime] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    const [activeAlert, setActiveAlert] = useState(null);

    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    // Reloj interno y comprobador de recordatorios
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            checkReminders(now);
        }, 1000); // Comprobamos cada segundo para mayor precisión en la demo

        return () => clearInterval(timer);
    }, [reminders]);

    const checkReminders = (now) => {
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTimeString = `${currentHours}:${currentMinutes}`;
        const todayString = now.toISOString().slice(0, 10); // YYYY-MM-DD

        const updatedReminders = [...reminders];
        let hasChanges = false;

        updatedReminders.forEach((reminder, index) => {
            // Si el recordatorio está activo, la hora coincide y no ha sonado hoy
            if (
                reminder.isActive &&
                reminder.time === currentTimeString &&
                reminder.lastTriggered !== todayString
            ) {
                triggerNotification(reminder);
                updatedReminders[index].lastTriggered = todayString;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            setReminders(updatedReminders);
        }
    };

    const triggerNotification = (reminder) => {
        if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
            // Intentar lanzar la notificación desde el Service Worker (formato nativo soportado en móviles como Android / iOS Web Push)
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('¡Recordatorio!', {
                    body: reminder.title,
                    icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png',
                    vibrate: [200, 100, 200],
                    requireInteraction: true
                });
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            // Fallback original para escritorios sin SW listo
            new Notification('¡Recordatorio!', {
                body: reminder.title,
                icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
            });
        }

        setActiveAlert(reminder);

        setTimeout(() => {
            setActiveAlert(null);
        }, 10000);
    };

    const handleAddReminder = (e) => {
        e.preventDefault();
        if (!newTitle.trim() || !newTime) return;

        const newReminder = {
            id: Date.now(),
            title: newTitle,
            time: newTime,
            isActive: true,
            lastTriggered: null
        };

        setReminders([...reminders, newReminder].sort((a, b) => a.time.localeCompare(b.time)));
        setIsAdding(false);
        setNewTitle('');
        setNewTime('');
    };

    const toggleReminder = (id) => {
        setReminders(reminders.map(r =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
        ));
    };

    const deleteReminder = (id) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    return (
        <div className="flex items-center justify-center min-h-[100dvh] sm:bg-gradient-to-br sm:from-indigo-500 sm:via-purple-500 sm:to-pink-500 bg-slate-50 sm:p-4 font-sans max-w-[100vw] overflow-hidden">

            <div className="relative w-full h-[100dvh] sm:h-[90vh] sm:max-w-[420px] bg-gradient-to-b from-slate-50 to-white sm:rounded-[2.5rem] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] sm:border-[10px] sm:border-gray-900 overflow-hidden flex flex-col">

                <div className="px-6 pt-14 sm:pt-8 pb-6 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tight relative z-10">
                        Recordatorios
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-1 relative z-10 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span>{reminders.filter(r => r.isActive).length} activos hoy</span>
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3 custom-scrollbar">
                    {reminders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                            <Bell size={48} className="opacity-20" />
                            <p>No tienes recordatorios.</p>
                        </div>
                    ) : (
                        reminders.map((reminder) => (
                            <div
                                key={reminder.id}
                                className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 ${reminder.isActive
                                    ? 'bg-white border border-blue-100 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)]'
                                    : 'bg-gray-50/80 border border-gray-100 opacity-75'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-2xl shadow-inner transition-colors duration-300 ${reminder.isActive
                                        ? 'bg-gradient-to-tr from-blue-500 to-indigo-400 text-white shadow-blue-500/30'
                                        : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        <Clock size={20} strokeWidth={reminder.isActive ? 2.5 : 2} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg tracking-tight transition-colors duration-300 ${reminder.isActive ? 'text-gray-800' : 'text-gray-400 line-through'
                                            }`}>
                                            {reminder.time}
                                        </h3>
                                        <p className={`text-sm font-medium transition-colors duration-300 ${reminder.isActive ? 'text-gray-500' : 'text-gray-400'
                                            }`}>
                                            {reminder.title}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end space-y-2">
                                    <button
                                        onClick={() => toggleReminder(reminder.id)}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out shadow-inner ${reminder.isActive ? 'bg-indigo-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${reminder.isActive ? 'translate-x-6' : 'translate-x-0'
                                            }`} />
                                    </button>

                                    <button
                                        onClick={() => deleteReminder(reminder.id)}
                                        className={`p-1.5 rounded-lg transition-all duration-300 ${reminder.isActive
                                            ? 'text-gray-300 hover:text-red-500 hover:bg-red-50'
                                            : 'text-gray-300 hover:text-red-400 hover:bg-red-50/50'
                                            }`}
                                        title="Eliminar recordatorio"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="absolute bottom-8 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-[0_10px_25px_rgba(79,70,229,0.5)] flex items-center justify-center hover:shadow-[0_15px_35px_rgba(79,70,229,0.6)] hover:scale-110 transition-all duration-300 transform active:scale-95 z-40 group"
                >
                    <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className={`absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] border-t border-white shadow-xl transition-transform duration-500 ease-out z-50 ${isAdding ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="p-7">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-800">Nuevo Recordatorio</h2>
                            <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-100/80 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddReminder} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué quieres recordar?</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Ej. Tomar la pastilla..."
                                    className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all font-medium"
                                    autoFocus={isAdding}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">¿A qué hora?</label>
                                <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all text-lg font-bold text-gray-700"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!newTitle.trim() || !newTime}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold mt-6 shadow-[0_8px_20px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:shadow-none disabled:bg-gray-400 disabled:bg-none flex items-center justify-center space-x-2 hover:shadow-[0_12px_25px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98]"
                            >
                                <Check size={20} className="stroke-[3]" />
                                <span>Guardar Recordatorio</span>
                            </button>
                        </form>
                    </div>
                </div>

                {isAdding && (
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-all duration-500"
                        onClick={() => setIsAdding(false)}
                    />
                )}

                {activeAlert && (
                    <div className="absolute top-12 left-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-start space-x-4 animate-[slideDown_0.3s_ease-out]">
                        <div className="bg-blue-500 p-2 rounded-full animate-bounce">
                            <BellRing size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-lg">¡Es la hora! ({activeAlert.time})</h4>
                            <p className="text-gray-300 text-sm mt-1">{activeAlert.title}</p>
                        </div>
                        <button
                            onClick={() => setActiveAlert(null)}
                            className="text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                <style>{`
          /* Animación personalizada para la notificación in-app */
          @keyframes slideDown {
            from { transform: translateY(-150%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          /* Ocultar scrollbar nativo pero permitir scroll */
          .custom-scrollbar::-webkit-scrollbar {
            width: 0px;
            background: transparent;
          }
        `}</style>
            </div>
        </div>
    );
}