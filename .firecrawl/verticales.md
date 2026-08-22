×

Papasud

# Hackathon Mar del Plata

# — verticales & niveles

Propuesta de tres verticales de problemas reales de la
operación diaria de Papasud, para sponsoreo y jurado —
con niveles de dificultad creciente y objetivos por equipo.

VERTICALES
03 — datos, campo, stock

FOCO
Software con IA integrada

---

0 1

## Sobre Papasud y este documento

## CONTEXTO

Papasud es una empresa familiar de 140 años dedicada a la producción de
semilla de papa, con foco creciente en exportación (25–30% del negocio)
sobre una base de aproximadamente 200 hectáreas y 7.500 toneladas de
semilla producidas por ciclo. El negocio se sostiene en dos pilares: la calidad
de la semilla que se produce y el trabajo que se vuelca en esa semilla.

Así se logra la confianza que los clientes depositan en Papasud y sus
semillas para responder a sus necesidades y afianzar un vínculo perdurable.
Este documento propone tres verticales de problemas reales de la operación
diaria, pensadas para que equipos de desarrolladores las resuelvan en el
marco de una hackathon de un día.

## CÓMO USAR ESTE DOCUMENTO

Cada vertical tiene tres niveles de profundidad creciente, para que equipos
de distinta experiencia técnica puedan participar con una meta alcanzable en
un día: un nivel inicial, uno intermedio y uno avanzado (stretch). El objetivo
es que cada equipo desarrolle prototipos funcionales que aborden problemas
reales de la operación diaria de Papasud, utilizando herramientas modernas
de desarrollo e inteligencia artificial.

**Próximo paso —** una vez cerrado el contenido de este documento, se define
qué “assets” (datos de muestra, documentación, fotos, accesos) prepara y
entrega Papasud para el día del evento. Formato, cantidad y nivel de
anonimización de cada asset se resuelven en una etapa aparte.

## LECTURA D E LOS NIVELES

## N01

## Inicial

Un flujo acotado, alcanzable por cualquier equipo en el día — la IA
reemplaza un paso manual puntual (voz o texto libre a dato
estructurado).

## N02

## Intermedio

Agrega una capa de análisis o de cruce de información — el
sistema no solo registra, también interpreta y explica.

N03 **Avanzado (stretch)**

Modelos predictivos, visión o agentes que cruzan fuentes —
pensado para equipos con más experiencia o tiempo de sobra.

-

---

## PROBLEMA REAL

Gran parte de la información histórica de la empresa — más de 20 años de datos productivos y comerciales —
vive en un archivo de Excel. Es la base de datos de facto de Papasud: se usa para tomar decisiones, pero es difícil
de consultar, no está protegida contra errores humanos, y no genera ningún tipo de proyección a futuro. El
conocimiento acumulado depende de que alguien sepa dónde buscar dentro de esa planilla.

## N01

## Copiloto conversacional sobre el histórico

## QUÉ CONSTRUYE EL EQUIPO

Una aplicación donde cualquier persona de Papasud
puede hacer una pregunta en lenguaje natural sobre los
datos históricos (por ejemplo: “¿cómo rindió la variedad X
en la campaña 2021?”) y recibir una respuesta basada
exclusivamente en los datos reales, sin inventar números.

## CÓMO SE INTEGRA LA IA

El sistema traduce la pregunta en una consulta sobre los
datos reales — no le pide al modelo que “recuerde” los
números, se los da como contexto verificable — y
devuelve una respuesta citando la fuente. Puede aceptar
la pregunta por texto o por voz.

## DATOS Y RECURSOS PROVISTOS

Base de datos consolidada de campañas recientes,
estructurada para facilitar la consulta histórica.

## N02

## Panel de indicadores con análisis automático

## QUÉ CONSTRUYE EL EQUIPO

Un tablero que muestra la evolución de indicadores clave
(rendimiento, superficie, producción) a lo largo de los
años, y que además redacta automáticamente un
resumen de lo que está pasando en los datos.

## CÓMO SE INTEGRA LA IA

En lugar de que una persona tenga que interpretar los
gráficos, el sistema detecta variaciones relevantes año a
año y genera un texto explicando qué cambió y en qué
magnitud.

## DATOS Y RECURSOS PROVISTOS

Base de datos histórica unificada y normalizada para el
análisis comparativo de indicadores clave.

## N03

## AVANZADO

## Modelo predictivo de aptitud de semilla

## QUÉ CONSTRUYE EL EQUIPO

Un modelo que, dado un lote/ubicación y ciertas
condiciones climáticas, estima qué tan bien va a rendir
una variedad de semilla determinada, basado en ensayos
históricos in situ.

## CÓMO SE INTEGRA LA IA

Además del modelo predictivo (aprendizaje automático
clásico), se usa un modelo de lenguaje para explicar la
predicción en términos entendibles para un ingeniero
agrónomo, no solo como un número.

## DATOS Y RECURSOS PROVISTOS

Conjunto de datos de muestreo de campo y variables
climáticas para entrenamiento de modelos.

-

---

## PROBLEMA REAL

Las órdenes de trabajo — qué se hizo, en qué lote, cuándo y con qué insumos — se arman hoy de forma manual,
muchas veces después de haber estado todo el día en el campo. Es un proceso lento, propenso a errores, y sin
conexión directa con ningún sistema central.

## N01

## Órdenes de trabajo por voz o texto libre

## QUÉ CONSTRUYE EL EQUIPO

Una herramienta donde el ingeniero, desde el campo,
cuenta en sus propias palabras (hablado o escrito) lo que
hizo, y el sistema genera automáticamente la orden de
trabajo estructurada (lote, tarea, insumos, fecha).

## CÓMO SE INTEGRA LA IA

El modelo interpreta lenguaje libre y extrae los datos que
corresponden a cada campo del formulario, sin que el
ingeniero tenga que completar nada manualmente.

## DATOS Y RECURSOS PROVISTOS

Diccionario de insumos, dosis recomendadas y ejemplos
de registros de actividad en terreno.

## N02

## Registro fotográfico vinculado

## QUÉ CONSTRUYE EL EQUIPO

Una solución que optimice la vinculación automática de
fotografías del lote durante la visita con su orden de
trabajo correspondiente, asegurando que el registro visual
no se pierda y mantenga su valor agronómico.

## CÓMO SE INTEGRA LA IA

Reconocimiento de imágenes que identifica el estado
visible del cultivo (por ejemplo, señales de estrés o de
una plaga) y lo traduce en una nota de texto vinculada al
registro.

## DATOS Y RECURSOS PROVISTOS

Galería de imágenes de cultivos etiquetadas y registros
agronómicos asociados.

## N03

## AVANZADO

## Detección de anomalías con imágenes satelitales

## QUÉ CONSTRUYE EL EQUIPO

Un sistema que cruza imágenes satelitales (de acceso
público) de los campos de Papasud con las órdenes de
trabajo activas, y señala zonas que muestran signos de
problema sin que todavía haya una orden de trabajo
asociada.

## CÓMO SE INTEGRA LA IA

Un agente que compara automáticamente lo que “ve” en
la imagen satelital con lo que está registrado en el
sistema, y sugiere una acción concreta cuando encuentra
una zona sin cobertura (por ejemplo: “posible estrés
hídrico en el lote 8, sin orden de riego reciente”).

## DATOS Y RECURSOS PROVISTOS

Coordenadas geográficas de los lotes y acceso a fuentes
de imágenes satelitales históricas.

-

---

## PROBLEMA REAL

El stock de semilla está repartido en cuatro ubicaciones físicas (tres frigoríficos y un galpón), con alrededor de 150
lotes en total. El registro se hace en una planilla que varias personas editan al mismo tiempo, lo que genera
errores de versión. Nadie tiene una visión única y confiable de cuánto stock hay y dónde está en un momento dado
— y las diferencias entre lo que dice la planilla y lo que hay en la realidad suelen descubrirse recién al momento de
entregarle el pedido a un cliente.

## N01

## Movimientos de stock por voz o texto, sin planillas

## QUÉ CONSTRUYE EL EQUIPO

Un sistema de unificación de stock para las 4 ubicaciones
(frigoríficos y galpones). El objetivo es que los operarios
registren movimientos mediante voz o texto, validando
automáticamente la disponibilidad para evitar
discrepancias entre el origen y el destino.

## CÓMO SE INTEGRA LA IA

El modelo interpreta lenguaje libre (voz o texto) y lo
convierte en una transacción estructurada (lote, cantidad,
origen, destino), reemplazando la carga manual en una
planilla compartida.

## DATOS Y RECURSOS PROVISTOS

Estructura de datos de stock actual, ubicaciones y flujos
logísticos de la operación.

## N02

## Vista única de stock en las cuatro ubicaciones

## QUÉ CONSTRUYE EL EQUIPO

Un tablero de control en tiempo real que prevenga la
emisión de órdenes de carga o remitos si no existe stock
real verificado en la ubicación correspondiente.

## CÓMO SE INTEGRA LA IA

Cuando hay una diferencia entre lo declarado y lo
contado, el sistema no solo la señala — propone una
hipótesis en lenguaje simple sobre cuál puede ser la
causa más probable (por ejemplo: “un movimiento del
12/08 posiblemente no se registró en destino”).

## DATOS Y RECURSOS PROVISTOS

Registros de inventario y casos de uso sobre
discrepancias comunes en la conciliación de stock.

## N03

## AVANZADO

## Copiloto de documentación para exportación

## QUÉ CONSTRUYE EL EQUIPO

Un asistente para la generación de facturas proformas y
documentación de exportación. La herramienta debe
permitir la creación de documentos mediante dictado o
selección rápida de datos de trazabilidad.

## CÓMO SE INTEGRA LA IA

El sistema lee los requisitos documentales (a partir de
ejemplos de formularios o normativa que provea
Papasud) y los cruza con los datos de trazabilidad de un
lote específico para pre-completar lo que ya se sabe.

## DATOS Y RECURSOS PROVISTOS

Plantillas documentales y requisitos solicitados por
organismos de control para la exportación de semilla.

-