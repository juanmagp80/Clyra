// Componente mejorado para el Detector Automático de Eventos
// Incluir en AIAutomationsPageClient.tsx después de la línea 860

                case 'auto_detect':
                    // Panel de Control del Detector Automático
                    console.log('🔍 Executing automatic event detection...');
                    
                    try {
                        // Obtener user ID para el detector automático
                        const supabaseForAuto = createSupabaseClient();
                        const { data: { user: autoUser }, error: autoUserError } = await supabaseForAuto.auth.getUser();
                        
                        if (autoUserError || !autoUser) {
                            throw new Error('Usuario no autenticado');
                        }

                        // Paso 1: Detectar eventos disponibles
                        setExecutionResults(prev => ({
                            ...prev,
                            [currentAutomation.id]: {
                                status: 'detecting',
                                message: '🔍 Escaneando base de datos para detectar eventos...'
                            }
                        }));

                        const detectResponse = await fetch(`/api/ai/workflows/auto?userId=${autoUser.id}&hours=${modalData.hours || 24}`, {
                            method: 'GET'
                        });

                        const detectResult = await detectResponse.json();

                        if (!detectResponse.ok) {
                            throw new Error(detectResult.error || 'Error al detectar eventos');
                        }

                        // Mostrar eventos detectados
                        const eventsFound = detectResult.eventsFound || 0;
                        
                        if (eventsFound === 0) {
                            setExecutionResults(prev => ({
                                ...prev,
                                [currentAutomation.id]: {
                                    status: 'completed',
                                    message: '✅ Escaneo completado - No se encontraron eventos recientes',
                                    eventsFound: 0,
                                    events: [],
                                    period: detectResult.period
                                }
                            }));

                            showToast('📊 Escaneo completado - No hay eventos nuevos en las últimas 24h', 'info');
                            setExecuting(null);
                            return;
                        }

                        // Paso 2: Procesar eventos automáticamente
                        setExecutionResults(prev => ({
                            ...prev,
                            [currentAutomation.id]: {
                                status: 'processing',
                                message: `🤖 Procesando ${eventsFound} eventos detectados...`,
                                eventsFound: eventsFound,
                                events: detectResult.events
                            }
                        }));

                        // Solo procesar si el usuario confirma o si está en modo automático
                        if (modalData.autoProcess !== false) {
                            const processResponse = await fetch('/api/ai/workflows/auto', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    autoDetect: true,
                                    userId: autoUser.id
                                })
                            });

                            const processResult = await processResponse.json();

                            if (!processResponse.ok) {
                                throw new Error(processResult.error || 'Error procesando eventos');
                            }

                            // Resultado final
                            setExecutionResults(prev => ({
                                ...prev,
                                [currentAutomation.id]: {
                                    status: 'completed',
                                    message: '🎉 Automatización completada exitosamente',
                                    eventsFound: eventsFound,
                                    eventsProcessed: processResult.processedEvents || 0,
                                    emailsGenerated: processResult.events?.length || 0,
                                    events: detectResult.events,
                                    generatedEmails: processResult.events,
                                    period: detectResult.period
                                }
                            }));

                            showToast(
                                `🎉 ¡Automatización exitosa! ${processResult.processedEvents || 0} eventos procesados, ${processResult.events?.length || 0} emails generados con IA`,
                                'success'
                            );
                        } else {
                            // Solo mostrar eventos detectados, sin procesar
                            setExecutionResults(prev => ({
                                ...prev,
                                [currentAutomation.id]: {
                                    status: 'detected',
                                    message: `📊 ${eventsFound} eventos detectados - Listos para procesar`,
                                    eventsFound: eventsFound,
                                    events: detectResult.events,
                                    period: detectResult.period
                                }
                            }));

                            showToast(`📊 Se detectaron ${eventsFound} eventos. Haz clic en "Procesar" para generar emails automáticamente`, 'info');
                        }

                        fetchRecentInsights(); // Actualizar insights
                        setExecuting(null);
                        return; // Salir aquí para evitar el flujo normal

                    } catch (error) {
                        console.error('Error en detector automático:', error);
                        setExecutionResults(prev => ({
                            ...prev,
                            [currentAutomation.id]: {
                                status: 'error',
                                message: `❌ Error: ${error.message}`,
                                error: error.message
                            }
                        }));
                        showToast(`❌ Error en detector automático: ${error.message}`, 'error');
                        setExecuting(null);
                        return;
                    }
