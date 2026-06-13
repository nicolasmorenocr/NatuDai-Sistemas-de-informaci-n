-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         12.3.2-MariaDB - MariaDB Server
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.17.0.7270
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para natudai
CREATE DATABASE IF NOT EXISTS `natudai` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `natudai`;

-- Volcando estructura para tabla natudai.bom_receta
CREATE TABLE IF NOT EXISTS `bom_receta` (
  `id_producto` varchar(36) NOT NULL,
  `id_mp` varchar(36) NOT NULL,
  `cantidad_necesaria` decimal(10,4) NOT NULL,
  PRIMARY KEY (`id_producto`,`id_mp`),
  KEY `fk_bom_mp` (`id_mp`),
  CONSTRAINT `fk_bom_mp` FOREIGN KEY (`id_mp`) REFERENCES `materia_prima` (`id_mp`) ON DELETE CASCADE,
  CONSTRAINT `fk_bom_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla natudai.bom_receta: ~2 rows (aproximadamente)
INSERT INTO `bom_receta` (`id_producto`, `id_mp`, `cantidad_necesaria`) VALUES
	('prod-fresa-deshid', 'mp-bentonita-nat', 0.0500),
	('prod-fresa-deshid', 'mp-fresa-fresca', 1.2000);

-- Volcando estructura para tabla natudai.cliente
CREATE TABLE IF NOT EXISTS `cliente` (
  `id_cliente` varchar(36) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `nit` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nivel_partner` varchar(50) DEFAULT 'Estándar',
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `nit` (`nit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla natudai.cliente: ~0 rows (aproximadamente)

-- Volcando estructura para tabla natudai.detalle_pedido
CREATE TABLE IF NOT EXISTS `detalle_pedido` (
  `id_pedido` varchar(36) NOT NULL,
  `id_producto` varchar(36) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_pedido`,`id_producto`),
  KEY `fk_det_producto` (`id_producto`),
  CONSTRAINT `fk_det_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE,
  CONSTRAINT `fk_det_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla natudai.detalle_pedido: ~0 rows (aproximadamente)

-- Volcando estructura para tabla natudai.lote_produccion
CREATE TABLE IF NOT EXISTS `lote_produccion` (
  `id_lote` varchar(36) NOT NULL,
  `id_maquina` varchar(36) NOT NULL,
  `id_producto` varchar(36) NOT NULL,
  `id_usuario` varchar(36) NOT NULL,
  `cantidad_esperada` decimal(10,2) NOT NULL,
  `fecha_inicio` datetime DEFAULT current_timestamp(),
  `fecha_fin_estimada` datetime DEFAULT NULL,
  `estado_lote` varchar(50) DEFAULT 'En Proceso',
  PRIMARY KEY (`id_lote`),
  KEY `fk_lote_maquina` (`id_maquina`),
  KEY `fk_lote_producto` (`id_producto`),
  KEY `fk_lote_usuario` (`id_usuario`),
  CONSTRAINT `fk_lote_maquina` FOREIGN KEY (`id_maquina`) REFERENCES `maquina` (`id_maquina`),
  CONSTRAINT `fk_lote_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `fk_lote_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla natudai.lote_produccion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla natudai.maquina
CREATE TABLE IF NOT EXISTS `maquina` (
  `id_maquina` varchar(36) NOT NULL,
  `nombre_maquina` varchar(100) NOT NULL,
  `estado_actual` varchar(50) DEFAULT 'Operativa',
  PRIMARY KEY (`id_maquina`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla natudai.maquina: ~1 rows (aproximadamente)
INSERT INTO `maquina` (`id_maquina`, `nombre_maquina`, `estado_actual`) VALUES
	('maq-deshid-01', 'Deshidratadora Industrial T-100', 'Operativa');

-- Volcando estructura para tabla natudai.materia_prima
CREATE TABLE IF NOT EXISTS `materia_prima` (
  `id_mp` varchar(36) NOT NULL,
  `id_proveedor` varchar(36) NOT NULL,
  `nombre_mp` varchar(100) NOT NULL,
  `stock_actual` decimal(10,2) DEFAULT 0.00,
  `stock_minimo` decimal(10,2) NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL,
  `unidad_medida` varchar(20) NOT NULL,
  PRIMARY KEY (`id_mp`),
  KEY `fk_mp_proveedor` (`id_proveedor`),
  CONSTRAINT `fk_mp_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla natudai.materia_prima: ~2 rows (aproximadamente)
INSERT INTO `materia_prima` (`id_mp`, `id_proveedor`, `nombre_mp`, `stock_actual`, `stock_minimo`, `costo_unitario`, `unidad_medida`) VALUES
	('mp-bentonita-nat', 'prov-agrovalle', 'Bentonita Natural', 200.00, 50.00, 800.00, 'Kg'),
	('mp-fresa-fresca', 'prov-agrovalle', 'Fresa Fresca', 500.00, 100.00, 1500.00, 'Kg');

-- Volcando estructura para tabla natudai.pedido
CREATE TABLE IF NOT EXISTS `pedido` (
  `id_pedido` varchar(36) NOT NULL,
  `id_cliente` varchar(36) NOT NULL,
  `id_usuario` varchar(36) NOT NULL,
  `fecha_orden` datetime DEFAULT current_timestamp(),
  `estado_pedido` varchar(50) DEFAULT 'Pendiente',
  `total_pagar` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_pedido`),
  KEY `fk_pedido_cliente` (`id_cliente`),
  KEY `fk_pedido_usuario` (`id_usuario`),
  CONSTRAINT `fk_pedido_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla natudai.pedido: ~0 rows (aproximadamente)

-- Volcando estructura para tabla natudai.producto
CREATE TABLE IF NOT EXISTS `producto` (
  `id_producto` varchar(36) NOT NULL,
  `nombre_producto` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `stock_actual` decimal(10,2) DEFAULT 0.00,
  `precio_venta` decimal(10,2) NOT NULL,
  `unidad_medida` varchar(20) NOT NULL,
  PRIMARY KEY (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla natudai.producto: ~1 rows (aproximadamente)
INSERT INTO `producto` (`id_producto`, `nombre_producto`, `descripcion`, `stock_actual`, `precio_venta`, `unidad_medida`) VALUES
	('prod-fresa-deshid', 'Fresa Deshidratada Premium', 'Fresa deshidratada natural en empaque aluminizado de 250g', 0.00, 24000.00, 'Und');

-- Volcando estructura para tabla natudai.proveedor
CREATE TABLE IF NOT EXISTS `proveedor` (
  `id_proveedor` varchar(36) NOT NULL,
  `razon_social` varchar(150) NOT NULL,
  `nit` varchar(50) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `nit` (`nit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla natudai.proveedor: ~1 rows (aproximadamente)
INSERT INTO `proveedor` (`id_proveedor`, `razon_social`, `nit`, `telefono`) VALUES
	('prov-agrovalle', 'AgroValle S.A.S.', '900.123.456-1', '311-555-0192');

-- Volcando estructura para tabla natudai.rol
CREATE TABLE IF NOT EXISTS `rol` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  `permisos_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Define a qué pestañas tiene acceso. Ej: ["/dashboard", "/inventario"]' CHECK (json_valid(`permisos_json`)),
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla natudai.rol: ~4 rows (aproximadamente)
INSERT INTO `rol` (`id_rol`, `nombre_rol`, `permisos_json`) VALUES
	(1, 'Administrador', '["/dashboard", "/inventario", "/produccion", "/ventas"]'),
	(2, 'Supply Chain', '["/inventario"]'),
	(3, 'Jefe de Producción', '["/inventario", "/produccion"]'),
	(4, 'Comercial', '["/ventas"]');

-- Volcando estructura para tabla natudai.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `id_usuario` varchar(36) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `estado_activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `cedula` (`cedula`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_user_rol` (`id_rol`),
  CONSTRAINT `fk_user_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla natudai.usuario: ~2 rows (aproximadamente)
INSERT INTO `usuario` (`id_usuario`, `id_rol`, `nombre_completo`, `cedula`, `email`, `password_hash`, `estado_activo`) VALUES
	('usr-admin-01', 1, 'Jefferson Acosta (CEO)', '10102020', 'ceo@natudai.com', 'admin123', 1),
	('usr-supply-01', 2, 'Marta Gómez (Logística)', '20203030', 'supply@natudai.com', 'supply123', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
