import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Carga de docentes reales del SIGA (LISTADO_DOCENTES CNE, 2026-1P).
 * Fuente: LISTADO_DOCENTES__CNE_-1803980844-20260915082510.xls
 *
 * Filtro aplicado: se excluyen 3 registros del reporte cuyo rol NO es DOCENTE
 * (RECTOR, VICERRECTOR, CONSERJE) -> quedan 109 de 112 filas del reporte.
 *
 * Separación apellidos/nombres: heurística 'últimos 2 tokens = nombres' (válida
 * para 108 de 109 registros, incluidos apellidos compuestos con DE/DEL/DE LA).
 * 1 caso ambiguo (cédula 1722254446, 3 tokens) resuelto por validación cruzada
 * contra MAESTRO_DE_NOTAS (orden invertido NOMBRES/APELLIDOS en esa fuente).
 *
 * NO se carga tiempo_dedicacion: la tabla docente no tiene columna para ese dato.
 * Queda documentado en out/docentes_dedicacion.csv por si se decide añadir la columna.
 *
 * Aditiva e idempotente (ON CONFLICT DO NOTHING sobre docente.cedula).
 */
export class SeedDatosRealesDocentes1790000000001 implements MigrationInterface {
  name = 'SeedDatosRealesDocentes1790000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1720060910', 'LUIS ALFREDO', 'SOSA MALLA', 'lsosa@yavirac.edu.ec', '0961981011', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1750242354', 'MICHELLE KATHERINE', 'AGUIRRE PINTADO', 'MAGUIRRE@YAVIRAC.EDU.EC', '0985838465', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('0800852733', 'CARMEN RAMONA', 'FARIAS MOREIRA', 'CARMEZAFARIAS0@GMAIL.COM', '0982617998', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1719156307', 'CRISTINA VANNESSA', 'PAVON QUINATOA', 'cpavon@yavirac.edu.ec', '0987488770', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1716318017', 'ANA CRISTINA', 'CHANGO SIMBAÑA', 'achango@yavirac.edu.ec', '0959855991', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1721719159', 'NADIA KARINA', 'FALCONI ESTRADA', 'nfalconi@yavirac.edu.ec', '0984119237', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1715622534', 'MARIA ISABEL', 'GUACHO TIPAN', 'mguacho@yavirac.edu.ec', '0994884873', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1805057641', 'GEOVANNY JAVIER', 'CUJANO GUACHI', 'GEOPLACE14@GMAIL.COM', '0995309366', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1721928461', 'DIEGO SEBASTIAN', 'DARQUEA ARGUERO', 'diego.darquea@gmail.com', '0960229717', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1707315691', 'LUIS PATRICIO', 'VICENTE GUTIERREZ', 'lvicente@yavirac.edu.ec', '0995117520', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1718349879', 'CRISTHIAN EDUARDO', 'VITERI VILLAFUERTE', 'cviteri@yavirac.edu.ec', '0998006754', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1718931726', 'IRENE PAOLA', 'TONATO LLIVISACA', 'itonato@yavirac.edu.ec', '0994831753', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1721162400', 'RUTH ELIZABETH', 'QUIGUANGO DELGADO', 'ruthi.qui@gmail.com', '0988220328', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1720648466', 'VERONICA JACQUELINE', 'RODRIGUEZ HERNANDEZ', 'vrodriguez@yavirac.edu.ec', '0983508323', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1719440925', 'JULIA LORENA', 'MALDONADO MORENO', 'jmaldonado@yavirac.edu.ec', '0990681418', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1720227386', 'LILIANA KATHERINE', 'GALARZA GONZALEZ', 'lgalarza@yavirac.edu.ec', '0996242125', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1713068631', 'ANTONELLA MARIVEL', 'NPVOA MEDINA', 'ANOVOA@YAVIRAC.EDU.EC', '0984505174', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1723470116', 'MUÑOZ PAREDES', 'FRANKS DAVID', 'fmunoz@yavirac.edu.ec', '0984645344', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1722254446', 'NATHALY', 'DURAND REINAGA', 'ndurand@yavirac.edu.ec', '0999917674', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1804544391', 'GABRIELA CATALINA', 'CASTRO SUAREZ', 'gcastro@yavirac.edu.ec', '0979127334', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1750112177', 'JUAN FRANCISCO', 'ALVARO CONCHAMBAY', 'juan.alvaro@intsuperior.edu.ec', '0981612835', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1708234867', 'LUIS ANIBAL', 'CHIPUXI FAJARDO', 'lchipuxi@yavirac.edu.ec', '0988090704', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1708393184', 'CARMEN ALICIA', 'MONCAYO NOROÑA', 'cmoncayo@yavirac.edu.ec', '0987496304', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1709740169', 'MIGUEL ALONZO', 'MUÑOZ DE LA TORRE', 'mmunoz@yavirac.edu.ec', '0984083362', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1716190168', 'SOFIA GABRIELA', 'PINTO MOLINA', 'spinto@yavirac.edu.ec', '0984258303', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1715798896', 'DEL CONSUELO', 'TAYUPANTA LOPEZ AMPARO', 'atayupanta@yavirac.edu.ec', '0995225249', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1716201098', 'ANDRES FRANCISCO', 'CARVAJAL PROAÑO', 'ACARVAJAL@YAVIRAC.EDU.EC', '0995426293', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1721125613', 'GABRIELA ALEXANDRA', 'CORAL REYES', 'gcoral@yavirac.edu.ec', '0995160129', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1804257820', 'LUIS DARIO', 'NIETO PICO', 'lnieto@yavirac.edu.ec', '0982472569', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1714955760', 'DAVID ALEJANDRO', 'VIZUETE AREVALO', 'dvizuete@yavirac.edu.ec', '0998909920', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1707716435', 'GEOVANNI WLADIMIR', 'PAZMIÑO SALAZAR', 'gpazmino@yavirac.edu.ec', '0959607758', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1720165057', 'ANDRES VINICIO', 'GONZALEZ CASTRO', 'agonzalez@yavirac.edu.ec', '0995685546', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1720574464', 'MICHELLE TALIA', 'ARGUELLO MOGROVEJO', 'marguello@yavirac.edu.ec', '0983283007', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1723455851', 'CARLOS ANDRES', 'CARRION DAQUILEMA', 'ccarrion@yavirac.edu.ec', '0998316746', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1712721677', 'VICENTE ALEJANDRO', 'ARROYO HUERTA', 'varroyo@yavirac.edu.ec', '0998127501', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('0602464265', 'MYRIAM CECILIA', 'SAMPEDRO REDROBAN', 'MSAMPEDRO@YAVIRAC.EDU.EC', '0984862347', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1714333877', 'LENIN MAURICIO', 'PAREDES PEREZ', 'lparedes@yavirac.edu.ec', '0998941126', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1713222527', 'MARCELO VINICIO', 'ARGOTI PAEZ', 'margoti@yavirac.edu.ec', '0958647561', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1721406948', 'ANA BELEN', 'ZALDUMBIDE VIZCAINO', 'ANITA_BELEN7592@HOTMAIL.COM', '0996401142', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1722379334', 'PAOLA FERNANDA', 'FACTOS GUAYASAMIN', 'pfactos@yavirac.edu.ec', '0987496051', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1400655237', 'DIANA CAROLINA', 'VALDIVIEZO RODRIGUEZ', 'VALDIVIEZODC@GMAIL', '0995904782', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1722309091', 'SOFIA ALEXANDRA', 'BOHORQUEZ VALENCIA', 'sbohorquez@yavirac.edu.ec', '0993979010', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1720905304', 'DANIELA ELIZABETH', 'CUPUERAN ANDRADE', 'dcupueran@yavirac.edu.ec', '0959271406', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1724935042', 'ANGEL JAVIER', 'ANACLETO MEDINA', 'javier_gastronomia@outlook.es', '0983032556', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1714802772', 'LOS ÁNGELES', 'PAVÓN CÓRDOVA MARÍA DE', 'mpavon@yavirac.edu.ec', '0992129749', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1711178119', 'YOLANDA ELIZABETH', 'MOYA CARRERA', 'ymoya@yavirac.edu.ec', '0978906767', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1712641933', 'RAÚL ALEJANDRO', 'PÁEZ ANDRADE', 'rpaez@yavirac.edu.ec', '0995477883', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1713330718', 'FRANCISCO FABIAN', 'MONTERO ESTACIO', 'FRANCISCOFABIANME@HOTMAIL.COM', '0993708828', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('0502212806', 'FANNY GUADALUPE', 'SANCHEZ CALI', 'fsanchez@yavirac.edu.ec', '0998975921', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1709918914', 'PAOLA TAMARA', 'ROMERO RAMIREZ MIRYAM', 'mromero@yavirac.edu.ec', '0987355193', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1713390589', 'EVELYN CATALINA', 'PROAÑO GARCES', 'eproano@yavirac.edu.ec', '0984668646', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('0401022892', 'DEBORA ELIZABETH', 'MERA CASTILLO', 'dmera@yavirac.edu.ec', '0964009746', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1717590101', 'CARLA ESTEFANIA', 'VALENCIA VALENCIA', 'cvalencia@yavirac.edu.ec', '0998135458', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1717723637', 'MARCIA ELIZABETH', 'GARCIA ORTIZ', 'mgarcia@yavirac.edu.ec', '0996134456', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('0702128760', 'MARTHA MAGDALENA', 'GAONA ARCENTALES', 'mgaona@yavirac.edu.ec', '0987387083', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1716430580', 'DANILO LENIN', 'ESTEVEZ TERAN', 'destevez@yavirac.edu.ec', '0980340165', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1721877270', 'DIEGO ALEXANDER', 'YANEZ FLORES', 'dyanez@yavirac.edu.ec', '0960901967', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1707320212', 'SANTIAGO MAXIMILIANO', 'PAZOS CARRILLO', 'santiagopazos96@gmail.com', '0969529775', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('0401357660', 'MARIA CRISTINA', 'VIZCAINO NARVAEZ', 'MACRISVINA@GMAIL.COM', '0987400055', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1717065161', 'MARIA EDELINA', 'VILLAGRAN OLIVO', 'mvillagran@yavirac.edu.ec', '0983168194', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1727215574', 'ERIKA LILIANA', 'ARIAS CORO', 'earias@yavirac.edu.ec', '0968364933', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1712894235', 'PATRICIO RENAN', 'CORELLA ARROBA', 'pcorella@yavirac.edu.ec', '0992614100', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1715037055', 'DEL PILAR', 'PILLAJO GUAILLAS CONSUELO', 'cpillajo@yavirac.edu.ec', '0984816396', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1717078818', 'MAURICIO ALEJANDRO', 'GUAMAN CHANGO', 'mguaman@yavirac.edu.ec', '0987121081', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1724909443', 'CESAR MAURICIO', 'TAMAYO LOPEZ', 'ctamayo@yavirac.edu.ec', '0982417259', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1704158821', 'SIGRID MARIA', 'RODRIGUEZ CABRERA', 'srodriguez@yavirac.edu.ec', '0992754376', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1716848443', 'PABLO XAVIER', 'SAENZ QUIMBIULCO', 'psaenz@yavirac.edu.ec', '0984619989', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1723407803', 'JOMAIRA ROCIO', 'LUGMAÑA OTO', 'jlumana@yavirac.edu.ec', '0984270501', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1721146486', 'ALEX FERNANDO', 'SUAREZ PEREZ', 'ALEXSUAREZ172114@HOTMAIL.COM', '0992813498', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1803980844', 'BYRON RODRIGO', 'MORENO MORENO', 'bmoreno@yavirac.edu.ec', '0984628338', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1714966221', 'LOS ANGELES', 'ACELDO RODRIGUEZ DAICY DE', 'daceldo@yavirac.edu.ec', '0992942489', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1718918830', 'SANDRA PAOLA', 'GUIZADO ESPINOSA', 'sguizado@yavirac.edu.ec', '0992754376', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1722146907', 'CARLA STEPHANIE', 'GONZALEZ LOPEZ', 'cgonzalez@yavirac.edu.ec', '0992728852', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1718170614', 'ELIZABETH ALEJANDRA', 'CARDENAS DUQUE', 'ecardenas@yavirac.edu.ec', '0960543100', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1712529658', 'ROBERTO MISAEL', 'CHIGUANO RUIZ', 'robertomisael1977@hotmail.com', '0998096043', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('0911756856', 'DEL PILAR', 'CASTILLO HARO KARINA', 'kcastillo@yavirac.edu.ec', '0982524634', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1718125519', 'JENNY PATRICIA', 'VILLARROEL TUSTON', 'jvillarroel@yavirac.edu.ec', '0987293207', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1712960085', 'MARUJA ISMERIA', 'ORTEGA GARZON', 'mortega@yavirac.edu.ec', '0994906763', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1711077410', 'ALEXANDRA PATRICIA', 'GORDON MUÑOZ', 'agordon@yavirac.edu.ec', '0988194574', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1712864642', 'LUIS GABRIEL', 'CIFUENTES VELA', 'lgv.cifuentes@yavirac.edu.ec', '0995432726', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1721638474', 'JUAN PABLO', 'CORREA GOMEZ', 'jpg.correa@yavirac.edu.ec', '0998233815', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1722042841', 'ADRIAN RAFAEL', 'EGAS HUERTA', 'aegas@yavirac.edu.ec', '0987018440', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1720241049', 'MÓNICA ELIZABETH', 'UNAUCHO CÓNDOR', NULL, NULL, 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1710533298', 'EDISON BOLIVAR', 'LOPEZ ACURIO', 'elopez@yavirac.edu.ec', '0997458286', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1002889986', 'CARMEN AMELIA', 'GUATEMAL ANRANGO', 'cguatemal@yavirac.edu.ec', '0998361176', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1719261768', 'MARIA TERESA', 'VERA CABRERA', 'maria.vera@csnm.edu.ec', '0996694575', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1714329842', 'CINTIA CAROLINA', 'CRUZ BÁEZ', 'ccruz@yavirac.edu.ec', '0995716022', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1755930870', 'KAREN YEMIMA', 'MENDIETA ZAMBRANO', 'KMENDIETA@YAVIRAC.EDU.EC', '0984309920', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1709439010', 'EDDY REYNALDO', 'VARGAS CARVAJAL', 'EDDY_R_VARGAS@HOTMAIL.COM', '0986088421', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1715044572', 'ROLANDO AMILCAR', 'TORRES CARRERA', 'rtorres@yavirac.edu.ec', '0983240310', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1721907655', 'VIVIANA JANETH', 'CUATIN CARPIO', 'vcuatin@yavirac.edu.ec', '0990606433', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1721714291', 'MARIA ELIZABETH', 'MAILA QUINGA', 'mmaila@yavirac.edu.ec', '0983146414', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1723171482', 'FREDDY DANIEL', 'CHILIG COLLAGUAZO', 'fchilig@yavirac.edu.ec', '0981518252', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1719318881', 'CYNTHIA CAROLINA', 'VALVERDE JACOME', 'cvalverde@yavirac.edu.ec', '0992728492', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1711973030', 'DEL CARMEN', 'ANDRANGO MORETA MARIA', 'mandrango@yavirac.edu.ec', '0967326663', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1705041646', 'JUAN DOENITZ', 'MARTINEZ GUEVARA', 'jmartinez@yavirac.edu.ec', '0979923372', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1718465022', 'GEOVANNY MAURICIO', 'VERDEZOTO BOSQUEZ', 'geovanny.verdezoto@outloock.com', '0984548574', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1722707849', 'DIEGO DAVID', 'SANTILLAN ALVAREZ', 'ddsantillan95@gmail.com', '0979154986', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1717675902', 'JAIME EDUARDO', 'GARCIA ZAPATA', 'egarcia.sips@gmail.com', '0998606656', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1711918639', 'JONNY ERNESTO', 'FRANCO MUÑOZ', 'JFRANCO@YAVIRAC.EDU.EC', '0985282333', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1716233265', 'LUIS DIEGO', 'PILLAJO TUFIÑO', 'lpillajo@yavirac.edu.ec', '0999674202', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1720081239', 'MAYRA ALEJANDRA', 'HERNANDEZ NOROÑA', 'mayri_ale1@hotmail.com', '0987543265', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1713724407', 'CHRISTIAN HERNAN', 'MEJIA HINOJOSA', 'cmejia@yavirac.edu.ec', '0996179149', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1715707830', 'MARIA FERNANDA', 'SEGOVIA BARAHONA', 'msegovia@yavirac.edu.ec', '0995935602', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1716247984', 'VERONICA ALEXANDRA', 'HERRERA FLORES', 'vherrera@yavirac.edu.ec', '0997186406', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1713867172', 'FAUSTO RAMIRO', 'SARRIA GUAÑA', 'fsarria@yavirac.edu.ec', '0984897590', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1717186462', 'PAÚL CÉSAR', 'PAREDES LLUMIQUINGA', 'pparedes@yavirac.edu.ec', '0999735420', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1712226255', 'DIEGO JAVIER', 'MOSQUERA IZURIETA', 'dmosquera@yavirac.edu.ec', '0999230811', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1715829105', 'ANDRES SEBASTIAN', 'CAÑIZARES NARANJO', 'acanizares@yavirac.edu.ec', '0998921621', 'ACTIVO')
      ON CONFLICT (cedula) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM public.docente WHERE cedula IN ('1720060910', '1750242354', '0800852733', '1719156307', '1716318017', '1721719159', '1715622534', '1805057641', '1721928461', '1707315691', '1718349879', '1718931726', '1721162400', '1720648466', '1719440925', '1720227386', '1713068631', '1723470116', '1722254446', '1804544391', '1750112177', '1708234867', '1708393184', '1709740169', '1716190168', '1715798896', '1716201098', '1721125613', '1804257820', '1714955760', '1707716435', '1720165057', '1720574464', '1723455851', '1712721677', '0602464265', '1714333877', '1713222527', '1721406948', '1722379334', '1400655237', '1722309091', '1720905304', '1724935042', '1714802772', '1711178119', '1712641933', '1713330718', '0502212806', '1709918914', '1713390589', '0401022892', '1717590101', '1717723637', '0702128760', '1716430580', '1721877270', '1707320212', '0401357660', '1717065161', '1727215574', '1712894235', '1715037055', '1717078818', '1724909443', '1704158821', '1716848443', '1723407803', '1721146486', '1803980844', '1714966221', '1718918830', '1722146907', '1718170614', '1712529658', '0911756856', '1718125519', '1712960085', '1711077410', '1712864642', '1721638474', '1722042841', '1720241049', '1710533298', '1002889986', '1719261768', '1714329842', '1755930870', '1709439010', '1715044572', '1721907655', '1721714291', '1723171482', '1719318881', '1711973030', '1705041646', '1718465022', '1722707849', '1717675902', '1711918639', '1716233265', '1720081239', '1713724407', '1715707830', '1716247984', '1713867172', '1717186462', '1712226255', '1715829105');
    `);
  }
}