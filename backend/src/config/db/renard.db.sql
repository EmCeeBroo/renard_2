-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 20, 2025 at 08:27 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `renard_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `restaurante_fk` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre`, `created_at`, `updated_at`, `restaurante_fk`) VALUES
(1, 'Sopas', '2025-09-10 00:56:19', '2025-09-18 03:02:39', 1),
(2, 'Ramen', '2025-09-17 01:08:59', '2025-09-17 01:08:59', 4),
(3, 'Carne', '2025-09-17 01:09:32', '2025-09-17 01:09:32', 2),
(6, 'Bebidas', '2025-09-19 02:50:20', '2025-09-19 02:57:03', 2);

-- --------------------------------------------------------

--
-- Table structure for table `estado_mesa`
--

CREATE TABLE `estado_mesa` (
  `id_estado_mesa` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estado_mesa`
--

INSERT INTO `estado_mesa` (`id_estado_mesa`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 'Disponible', 'Mesa sin reserva', '2025-06-28 00:16:47', '2025-06-28 00:16:47'),
(2, 'No disponible', 'La mesa no se encuentra disponible en ese horario', '2025-08-05 01:16:12', '2025-08-05 01:16:12');

-- --------------------------------------------------------

--
-- Table structure for table `estado_reservacion`
--

CREATE TABLE `estado_reservacion` (
  `id_estado_reservacion` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estado_reservacion`
--

INSERT INTO `estado_reservacion` (`id_estado_reservacion`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 'Disponible', 'Reservacion Disponible', '2025-04-09 22:14:46', '2025-04-09 22:14:46'),
(2, 'Pendiente', 'Reservacion sin confirmar', '2025-04-09 22:15:08', '2025-07-03 01:59:31'),
(3, 'Cancelado', 'Reservacion Cancelada', '2025-04-09 22:15:30', '2025-04-09 22:15:30');

-- --------------------------------------------------------

--
-- Table structure for table `estado_usuario`
--

CREATE TABLE `estado_usuario` (
  `id_estado_usuario` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estado_usuario`
--

INSERT INTO `estado_usuario` (`id_estado_usuario`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 'Activo', 'Usuario Activo en el sistema', '2025-04-09 22:17:45', '2025-04-09 22:17:45'),
(2, 'Bloqueado', 'Usuario Bloqueado en el sistema', '2025-04-09 22:18:40', '2025-04-09 22:18:40'),
(3, 'Activo', 'Usuario Activo en el sistema', '2025-04-12 15:58:33', '2025-04-12 15:58:33');

-- --------------------------------------------------------

--
-- Table structure for table `historial_reservacion`
--

CREATE TABLE `historial_reservacion` (
  `id_historial_reservacion` int NOT NULL,
  `fecha_cambio_estado` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `reservacion_fk` int NOT NULL,
  `estado_reservacion_fk` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `historial_reservacion`
--

INSERT INTO `historial_reservacion` (`id_historial_reservacion`, `fecha_cambio_estado`, `reservacion_fk`, `estado_reservacion_fk`) VALUES
(1, '2025-06-29 09:48:38', 4, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id_menu` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `restaurante_fk` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`id_menu`, `nombre`, `descripcion`, `restaurante_fk`, `created_at`, `updated_at`) VALUES
(1, 'Renard Oriental', 'Reúne los mejores y diferentes platos de la cultura oriental', 4, '2025-06-29 15:35:53', '2025-09-17 23:15:06'),
(2, 'McDonald Especial', 'Mejores platos de la gastronomía mexicana', 1, '2025-06-29 15:43:30', '2025-09-17 23:15:34'),
(4, 'Comida Chatarra', 'Hamburguesas y perros calientes', 1, '2025-07-12 19:01:11', '2025-09-17 23:15:20'),
(5, 'El Corral Infantil', 'Lo mejor para compartir con tus seres queridos más adorables', 2, '2025-09-18 00:59:11', '2025-09-18 00:59:11'),
(6, 'McDonald Secreto', 'Un menu especial solo para los miembros más frecuentes de McDonald', 1, '2025-09-19 02:52:49', '2025-09-19 02:52:49');

-- --------------------------------------------------------

--
-- Table structure for table `mesa`
--

CREATE TABLE `mesa` (
  `id_mesa` int NOT NULL,
  `zona_fk` int NOT NULL,
  `estado_mesa_fk` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `numero_mesa` varchar(3) COLLATE utf8mb4_general_ci NOT NULL,
  `sucursal_fk` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mesa`
--

INSERT INTO `mesa` (`id_mesa`, `zona_fk`, `estado_mesa_fk`, `created_at`, `updated_at`, `numero_mesa`, `sucursal_fk`) VALUES
(1, 1, 1, '2025-06-28 00:18:02', '2025-09-18 00:45:56', '2', 3),
(2, 2, 1, '2025-08-05 22:59:54', '2025-09-18 00:45:36', '1', 2),
(3, 1, 1, '2025-08-05 23:00:07', '2025-09-18 00:45:44', '2', 2),
(4, 1, 1, '2025-08-05 23:00:24', '2025-09-18 00:45:24', '3', 3),
(5, 2, 1, '2025-08-05 23:00:43', '2025-09-18 00:45:14', '2', 1),
(6, 1, 1, '2025-08-05 23:00:52', '2025-09-18 01:00:17', '10', 3),
(7, 1, 1, '2025-08-13 01:59:18', '2025-08-13 01:59:18', '1', 1),
(8, 2, 1, '2025-09-18 01:00:33', '2025-09-18 01:00:33', '1', 3);

-- --------------------------------------------------------

--
-- Table structure for table `perfil`
--

CREATE TABLE `perfil` (
  `id_perfil` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` bigint DEFAULT NULL,
  `direccion` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `foto` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `usuario_fk` int NOT NULL,
  `tipo_documento_fk` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `numero_documento` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `perfil`
--

INSERT INTO `perfil` (`id_perfil`, `nombre`, `apellido`, `telefono`, `direccion`, `foto`, `usuario_fk`, `tipo_documento_fk`, `created_at`, `updated_at`, `numero_documento`) VALUES
(1, 'Brayan Stivens', 'Mendez Leal', 3134204306, 'Calle 54 c sur n 100 75', NULL, 1, 1, '2025-04-12 16:26:40', '2025-04-12 16:26:40', 1012104567),
(2, 'Carlos', 'Perez', 3010110110, 'Kr 98C 60- 70 Norte', 'perfil-1756259743815-114527998.png', 4, 1, '2025-08-27 01:54:58', '2025-08-27 06:55:43', 10220011002);

-- --------------------------------------------------------

--
-- Table structure for table `producto`
--

CREATE TABLE `producto` (
  `id_producto` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `precio` int NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `imagenproducto` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `categoria_fk` int DEFAULT NULL,
  `menu_fk` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `producto`
--

INSERT INTO `producto` (`id_producto`, `nombre`, `precio`, `descripcion`, `imagenproducto`, `created_at`, `updated_at`, `categoria_fk`, `menu_fk`) VALUES
(1, 'McDonald Especial', 25000, 'Mejores platos de la gastronomía mexicana', '1751818219223-786118474.jpeg', '2025-06-29 14:56:23', '2025-09-18 23:37:23', 1, 4),
(3, 'Pizza', 18000, 'Pizza llena de queso', '1751817919859-623098335.png', '2025-07-06 16:05:19', '2025-09-18 01:16:17', 1, NULL),
(5, 'Ramen', 20000, 'Ramen Especial Tradicional Japones', '1751818092410-294581797.jpg', '2025-07-06 16:08:12', '2025-09-18 03:17:53', 1, 2),
(12, 'Hamburguesa Clásica Queso', 20000, 'Hamburguesa clásica de queso', '1758166815443-783846990.jpg', '2025-09-18 03:40:15', '2025-09-18 03:42:06', 1, 2),
(13, 'Comida Chatarra', 35000, 'Hamburguesas y perros calientes', '1758167009405-925538684.jpg', '2025-09-18 03:43:29', '2025-09-19 02:51:47', 1, 4);

-- --------------------------------------------------------

--
-- Table structure for table `qr_menu`
--

CREATE TABLE `qr_menu` (
  `id_qr_menu` int NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `codigo_qr` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `restaurante_fk` int NOT NULL,
  `menu_fk` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reservacion`
--

CREATE TABLE `reservacion` (
  `id_reservacion` int NOT NULL,
  `numero_personas` int NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `usuario_fk` int NOT NULL,
  `estado_reservacion` int NOT NULL,
  `restaurante_fk` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `anotaciones` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hora_fin` time NOT NULL,
  `mesa_fk` int DEFAULT NULL,
  `sucursal_fk` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservacion`
--

INSERT INTO `reservacion` (`id_reservacion`, `numero_personas`, `fecha`, `hora_inicio`, `usuario_fk`, `estado_reservacion`, `restaurante_fk`, `created_at`, `updated_at`, `anotaciones`, `hora_fin`, `mesa_fk`, `sucursal_fk`) VALUES
(3, 2, '2025-07-31', '00:00:00', 1, 1, 1, '2025-06-27 22:57:42', '2025-06-29 14:48:38', 'Nada', '00:00:00', NULL, NULL),
(4, 6, '2025-06-30', '00:00:00', 1, 1, 1, '2025-06-28 20:14:12', '2025-06-28 20:14:12', 'mesa grande', '00:00:00', NULL, NULL),
(5, 10, '2025-07-15', '00:00:00', 3, 1, 1, '2025-07-07 01:28:46', '2025-07-07 01:28:46', 'Ninguna', '00:00:00', NULL, NULL),
(6, 1, '2025-07-09', '00:00:00', 3, 1, 5, '2025-07-07 01:36:25', '2025-07-07 01:36:40', 'Completo', '00:00:00', NULL, NULL),
(7, 10, '2025-07-17', '00:00:00', 4, 1, 1, '2025-07-12 00:20:10', '2025-07-12 00:20:10', 'Mesa especial', '00:00:00', NULL, NULL),
(8, 3, '2025-07-20', '00:00:00', 4, 1, 3, '2025-07-12 01:55:31', '2025-07-12 01:55:31', 'Ninguna', '00:00:00', NULL, NULL),
(9, 2, '2025-07-31', '00:00:00', 4, 1, 2, '2025-07-12 17:45:04', '2025-07-12 17:45:04', 'cena', '00:00:00', NULL, NULL),
(11, 6, '2025-07-31', '00:00:00', 4, 1, 3, '2025-07-29 13:12:29', '2025-07-29 13:12:29', 'Todo limpio', '00:00:00', NULL, NULL),
(12, 3, '2025-07-31', '00:00:00', 4, 1, 2, '2025-08-06 00:42:04', '2025-08-06 00:42:04', 'Juan', '00:00:00', NULL, NULL),
(13, 4, '2025-08-06', '00:00:00', 4, 1, 1, '2025-08-06 01:04:18', '2025-09-12 01:26:36', 'Carlos Prueba', '01:52:00', 7, 1),
(14, 4, '2025-10-06', '10:00:00', 1, 1, 3, '2025-08-13 02:05:10', '2025-08-13 02:05:10', 'alergias', '12:00:00', 7, NULL),
(15, 3, '2025-08-27', '21:20:00', 4, 1, 1, '2025-08-25 23:20:36', '2025-08-25 23:27:25', 'La mejor atención posible por favor', '22:20:00', 7, NULL),
(16, 5, '2025-08-31', '20:30:00', 4, 1, 1, '2025-08-25 23:29:38', '2025-08-25 23:29:38', 'Mesa preferiblemente limpia', '21:55:00', 7, NULL),
(17, 8, '2025-09-06', '20:20:00', 4, 1, 1, '2025-08-27 23:19:06', '2025-08-27 23:19:06', 'Ninguna', '21:20:00', 7, NULL),
(18, 4, '2025-09-06', '19:30:00', 4, 1, 1, '2025-08-27 23:35:28', '2025-08-27 23:35:28', '', '20:20:00', 7, NULL),
(19, 3, '2025-08-28', '22:00:00', 4, 1, 1, '2025-08-28 00:16:23', '2025-08-28 00:16:23', 'Mejor atención por favor', '23:15:00', 7, NULL),
(20, 4, '2025-08-31', '21:24:00', 4, 1, 1, '2025-08-28 00:23:03', '2025-08-28 00:23:03', '', '22:22:00', 7, NULL),
(21, 6, '2025-09-03', '22:30:00', 4, 1, 1, '2025-08-28 00:28:10', '2025-08-28 00:28:10', '', '23:34:00', 7, NULL),
(22, 4, '2025-08-28', '19:32:00', 4, 1, 1, '2025-08-28 00:33:04', '2025-08-28 00:33:04', '', '20:32:00', 7, NULL),
(23, 2, '2025-09-02', '22:14:00', 4, 1, 1, '2025-08-28 01:14:54', '2025-08-28 01:14:54', 'Reserva prueba 1', '23:14:00', 7, NULL),
(24, 4, '2025-08-29', '22:31:00', 4, 1, 1, '2025-08-28 01:30:30', '2025-08-28 01:30:30', 'Prueba 2', '23:34:00', 7, NULL),
(25, 3, '2025-09-30', '21:40:00', 4, 1, 1, '2025-09-02 00:38:33', '2025-09-02 00:38:33', 'Brayan le gusta la tripa negra', '22:40:00', 7, NULL),
(26, 5, '2025-09-20', '13:00:00', 4, 1, 1, '2025-09-12 01:28:07', '2025-09-12 01:28:07', 'Ninguna', '14:27:00', 7, 1);

-- --------------------------------------------------------

--
-- Table structure for table `restaurante`
--

CREATE TABLE `restaurante` (
  `id_restaurante` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `url_menu` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `url_imagen` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `eslogan` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `restaurante`
--

INSERT INTO `restaurante` (`id_restaurante`, `nombre`, `url_menu`, `created_at`, `updated_at`, `url_imagen`, `descripcion`, `eslogan`) VALUES
(1, 'Mcdonalds', 'https://www.sopasypostres-mrg.com/la-carta/', '2025-04-09 22:14:07', '2025-09-04 02:40:03', '1751749043788-765227507.png', 'McDonald’s Colombia es una de las cadenas de comida rápida más reconocidas del país, operada por Arcos Dorados, el mayor franquiciado de la marca en América Latina. Desde su llegada en 1995, se ha consolidado como un lugar icónico para disfrutar hamburguesas, papas fritas y helados, adaptando su menú con opciones locales y manteniendo su eslogan mundial “I’m lovin’ it”.', 'I’m lovin’ it'),
(2, 'El Corral', 'https://www.elcorral.com/', '2025-04-13 00:52:04', '2025-07-03 23:08:33', 'restaurante1.png', NULL, NULL),
(3, 'Starbucks', 'https://www.starbucks.com.co/', '2025-04-13 01:23:31', '2025-07-01 21:19:39', 'restaurante2.png', NULL, NULL),
(4, 'Renard Pacifico', 'https://www.kfc.co/', '2025-04-13 16:10:17', '2025-07-01 21:19:57', 'restaurante8.png', NULL, NULL),
(5, 'Renard Fusión', 'https://renard.com', '2025-07-03 23:43:47', '2025-07-05 20:29:35', '1751747375566-720163629.jpeg', NULL, NULL),
(6, 'Alemania', 'https://renardmexico.com', '2025-07-03 23:51:59', '2025-07-03 23:54:14', '1751586719080-52929666.jpeg', NULL, NULL),
(7, 'crepes&waffles', 'http://crepes&waffles.html', '2025-08-09 20:32:52', '2025-09-20 18:56:23', '1754771572155-140017488.png', '', 'Lo mejor de la cocina');

-- --------------------------------------------------------

--
-- Table structure for table `rol`
--

CREATE TABLE `rol` (
  `id_rol` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `restaurante_fk` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre`, `descripcion`, `created_at`, `updated_at`, `restaurante_fk`) VALUES
(1, 'Admin', 'Administrador del sistema', '2025-04-09 22:13:07', '2025-04-09 22:13:07', NULL),
(2, 'Administrador Restaurante', 'Admin Restaurante', '2025-04-09 22:13:38', '2025-06-29 14:27:12', NULL),
(3, 'Usuario', 'Usuario del sistema', '2025-04-12 15:58:55', '2025-04-12 15:58:55', NULL),
(4, 'Cliente', 'Usuario', '2025-06-26 04:26:38', '2025-06-29 14:44:01', NULL),
(5, 'Adminitrador McDonald', 'Este rol es del usuario administrador del restaurante McDonald.', '2025-08-13 02:10:57', '2025-08-13 02:10:57', 1),
(6, 'Administrador ElCorral', 'Este rol es del administrador del restaurante el corral', '2025-09-02 00:51:31', '2025-09-02 00:51:31', 2),
(7, 'Administrador creep&waffers', 'Este rol es del administrador del restaurante creep&waffers', '2025-09-20 18:54:26', '2025-09-20 18:54:26', 7);

-- --------------------------------------------------------

--
-- Table structure for table `sucursal`
--

CREATE TABLE `sucursal` (
  `id_sucursal` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `horario_apertura` time NOT NULL,
  `horario_cierre` time NOT NULL,
  `restaurante_fk` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `sucursal`
--

INSERT INTO `sucursal` (`id_sucursal`, `nombre`, `direccion`, `horario_apertura`, `horario_cierre`, `restaurante_fk`, `created_at`, `updated_at`) VALUES
(1, 'McDonal Salitre', 'Av. La Esperanza #68a-93', '00:00:00', '23:59:00', 1, '2025-08-13 01:55:58', '2025-08-13 01:55:58'),
(2, 'McDonald\'s 1 Mayo', 'kr 69 B #25-12 34 sur', '00:00:00', '12:00:00', 1, '2025-09-03 01:24:49', '2025-09-03 01:41:20'),
(3, 'El Corral Plaza de Las Américas', 'Transversal 71D No. 26-94 Sur, Av. de las Américas #Local 291', '00:00:00', '23:59:00', 2, '2025-09-03 02:02:57', '2025-09-03 02:02:57');

-- --------------------------------------------------------

--
-- Table structure for table `tipo_documento`
--

CREATE TABLE `tipo_documento` (
  `id_tipo_documento` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tipo_documento`
--

INSERT INTO `tipo_documento` (`id_tipo_documento`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 'Cedula de Ciudadania', 'tipo de documento cedula de ciudadania', '2025-04-12 15:57:20', '2025-06-29 14:42:14');

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL,
  `correo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `estado_usuario_fk` int NOT NULL,
  `rol_fk` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reset_expiracion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `correo`, `contrasena`, `estado_usuario_fk`, `rol_fk`, `created_at`, `updated_at`, `reset_token`, `reset_expiracion`) VALUES
(1, 'alejo07@example.com', '$2b$10$uwKj34DE5MSG7/FdZTcR0OOoLqic/HYowCr/LzJ93iz7E2FjIIr.6', 1, 1, '2025-04-09 22:21:19', '2025-06-26 03:59:37', NULL, NULL),
(3, 'prueba1@example.com', '$2b$10$NXG9ikYoJ4aH9O4M04hfpeYGphuB9J6mEupElf9QAsZ6MR/3sdZxq', 1, 1, '2025-06-23 21:19:10', '2025-06-26 03:59:05', NULL, NULL),
(4, 'prueba2@example.com', '$2b$10$6pynugJqFqNcsAYgIjmeQuoUBLrG.JZrm35kl4e9GePlKDCKi2kJK', 1, 4, '2025-06-26 04:48:30', '2025-07-05 19:55:51', NULL, NULL),
(7, 'admin@email.com', '$2b$10$imdOh09nzLrS0g8sgaPWq.MFGdGm6Zq7N6HwLRI1AlezsQ7tpSHJq', 1, 1, '2025-07-05 19:28:43', '2025-07-05 19:28:43', NULL, NULL),
(8, 'luismiguelp98@gmail.com', '$2b$10$VoF59MzVGIcxU1wH6v/uuuc6DHU14bBpxlEd20qusQZFmFGIQaLKG', 1, 3, '2025-08-11 23:42:41', '2025-08-14 00:58:52', NULL, NULL),
(10, 'prueba3@example.com', '$2b$10$hhhZZ0.PdlE3CwdKsV9a6ue1brTC9oa8MdjFr5eyQApndHY5E8n.G', 1, 2, '2025-09-02 00:57:36', '2025-09-02 00:57:36', NULL, NULL),
(11, 'brayan@elcorral.com', '$2b$10$FP89cFk6LGqlhj6admuXxOOwn4xoF/3WonhOSXJ0GiIIDai8LHotS', 1, 6, '2025-09-02 23:08:20', '2025-09-02 23:08:20', NULL, NULL),
(12, 'alejo@mcdonald.com', '$2b$10$crZazLxPO.dUh4W4Kp78rezGc8YC8wMxJ1A58i0uNDUgDQwEq5vA.', 1, 5, '2025-09-02 23:14:41', '2025-09-04 01:50:13', NULL, NULL),
(13, 'andresfelipegonzalezavila11@gmail.com', '$2b$10$sL56VLtoY6ZBT3fe260IgOCrnggY6HqCXmTEfKNfeKcSSHw9nkN5K', 1, 4, '2025-09-13 02:01:30', '2025-09-13 02:01:30', NULL, NULL),
(14, 'janathan@creeps.com', '$2b$10$WJwLh6FUkj6J5NCbOUQBFuYYsURfsZbDA/JRpwDm4Zoga8/ccD.km', 1, 7, '2025-09-20 18:55:03', '2025-09-20 18:55:03', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `usuarios_api`
--

CREATE TABLE `usuarios_api` (
  `usuario_api_id` int NOT NULL,
  `usuario_api` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `contraseña_api` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rol_api` enum('Admin','Read-only') COLLATE utf8mb4_general_ci NOT NULL,
  `estado_api` enum('Active','Inactive') COLLATE utf8mb4_general_ci NOT NULL,
  `Created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios_api`
--

INSERT INTO `usuarios_api` (`usuario_api_id`, `usuario_api`, `contraseña_api`, `rol_api`, `estado_api`, `Created_at`, `Updated_at`) VALUES
(1, 'prueba123@example.com', '$2y$10$v2yJJNRjcXnC.I1kA9nsX.HYDSNHh/qNcwyqWCC4kLSYCF5q/Rlsq', 'Admin', 'Active', '2025-04-12 07:34:50', '2025-04-12 07:34:50'),
(7, 'presentacion1@example.com', '$2y$10$MHO12ay5mjgaxQYc2CX1/.EIdZNwU9mnGGYWYxE7pDxAAAgjIttoa', 'Read-only', 'Active', '2025-04-13 21:05:36', '2025-04-13 21:07:40');

-- --------------------------------------------------------

--
-- Table structure for table `zona`
--

CREATE TABLE `zona` (
  `id_zona` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `zona`
--

INSERT INTO `zona` (`id_zona`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 'Palco vip', 'Zona exclusiva para', '2025-06-28 00:17:49', '2025-06-28 20:46:28'),
(2, 'Zona infantil', 'Zona de recreación para infantes', '2025-06-28 20:08:41', '2025-06-28 20:08:41');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`),
  ADD KEY `fk_categoria_restaurante` (`restaurante_fk`);

--
-- Indexes for table `estado_mesa`
--
ALTER TABLE `estado_mesa`
  ADD PRIMARY KEY (`id_estado_mesa`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `estado_reservacion`
--
ALTER TABLE `estado_reservacion`
  ADD PRIMARY KEY (`id_estado_reservacion`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `estado_usuario`
--
ALTER TABLE `estado_usuario`
  ADD PRIMARY KEY (`id_estado_usuario`);

--
-- Indexes for table `historial_reservacion`
--
ALTER TABLE `historial_reservacion`
  ADD PRIMARY KEY (`id_historial_reservacion`),
  ADD KEY `reservacion_fk` (`reservacion_fk`),
  ADD KEY `fk_historialreserva_estadoreservacion` (`estado_reservacion_fk`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id_menu`),
  ADD KEY `restaurante_fk` (`restaurante_fk`);

--
-- Indexes for table `mesa`
--
ALTER TABLE `mesa`
  ADD PRIMARY KEY (`id_mesa`),
  ADD KEY `zona_fk` (`zona_fk`),
  ADD KEY `estado_mesa_fk` (`estado_mesa_fk`),
  ADD KEY `sucursal_fk` (`sucursal_fk`);

--
-- Indexes for table `perfil`
--
ALTER TABLE `perfil`
  ADD PRIMARY KEY (`id_perfil`),
  ADD UNIQUE KEY `direccion` (`direccion`),
  ADD KEY `usuario_fk` (`usuario_fk`),
  ADD KEY `tipo_documento_fk` (`tipo_documento_fk`);

--
-- Indexes for table `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `fk_producto_categoria` (`categoria_fk`),
  ADD KEY `fk_producto_menu` (`menu_fk`);

--
-- Indexes for table `qr_menu`
--
ALTER TABLE `qr_menu`
  ADD PRIMARY KEY (`id_qr_menu`),
  ADD KEY `restaurante_fk` (`restaurante_fk`),
  ADD KEY `menu_fk` (`menu_fk`);

--
-- Indexes for table `reservacion`
--
ALTER TABLE `reservacion`
  ADD PRIMARY KEY (`id_reservacion`),
  ADD KEY `usuario_fk` (`usuario_fk`),
  ADD KEY `estado_reservacion` (`estado_reservacion`),
  ADD KEY `restaurante_fk` (`restaurante_fk`),
  ADD KEY `fk_reservacion_mesa` (`mesa_fk`),
  ADD KEY `reservacion_sucursal_fk` (`sucursal_fk`);

--
-- Indexes for table `restaurante`
--
ALTER TABLE `restaurante`
  ADD PRIMARY KEY (`id_restaurante`);

--
-- Indexes for table `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`),
  ADD KEY `id_restaurante_fk` (`restaurante_fk`);

--
-- Indexes for table `sucursal`
--
ALTER TABLE `sucursal`
  ADD PRIMARY KEY (`id_sucursal`),
  ADD KEY `restaurante_fk` (`restaurante_fk`);

--
-- Indexes for table `tipo_documento`
--
ALTER TABLE `tipo_documento`
  ADD PRIMARY KEY (`id_tipo_documento`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD KEY `estado_usuario_fk` (`estado_usuario_fk`),
  ADD KEY `rol_fk` (`rol_fk`);

--
-- Indexes for table `usuarios_api`
--
ALTER TABLE `usuarios_api`
  ADD PRIMARY KEY (`usuario_api_id`);

--
-- Indexes for table `zona`
--
ALTER TABLE `zona`
  ADD PRIMARY KEY (`id_zona`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `estado_mesa`
--
ALTER TABLE `estado_mesa`
  MODIFY `id_estado_mesa` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `estado_reservacion`
--
ALTER TABLE `estado_reservacion`
  MODIFY `id_estado_reservacion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `estado_usuario`
--
ALTER TABLE `estado_usuario`
  MODIFY `id_estado_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `historial_reservacion`
--
ALTER TABLE `historial_reservacion`
  MODIFY `id_historial_reservacion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id_menu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `mesa`
--
ALTER TABLE `mesa`
  MODIFY `id_mesa` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `perfil`
--
ALTER TABLE `perfil`
  MODIFY `id_perfil` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `qr_menu`
--
ALTER TABLE `qr_menu`
  MODIFY `id_qr_menu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reservacion`
--
ALTER TABLE `reservacion`
  MODIFY `id_reservacion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `restaurante`
--
ALTER TABLE `restaurante`
  MODIFY `id_restaurante` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `sucursal`
--
ALTER TABLE `sucursal`
  MODIFY `id_sucursal` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tipo_documento`
--
ALTER TABLE `tipo_documento`
  MODIFY `id_tipo_documento` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `usuarios_api`
--
ALTER TABLE `usuarios_api`
  MODIFY `usuario_api_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `zona`
--
ALTER TABLE `zona`
  MODIFY `id_zona` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categoria`
--
ALTER TABLE `categoria`
  ADD CONSTRAINT `fk_categoria_restaurante` FOREIGN KEY (`restaurante_fk`) REFERENCES `restaurante` (`id_restaurante`);

--
-- Constraints for table `historial_reservacion`
--
ALTER TABLE `historial_reservacion`
  ADD CONSTRAINT `fk_historialreserva_estadoreservacion` FOREIGN KEY (`estado_reservacion_fk`) REFERENCES `estado_reservacion` (`id_estado_reservacion`),
  ADD CONSTRAINT `historial_reservacion_ibfk_1` FOREIGN KEY (`reservacion_fk`) REFERENCES `reservacion` (`id_reservacion`);

--
-- Constraints for table `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `menu_ibfk_2` FOREIGN KEY (`restaurante_fk`) REFERENCES `restaurante` (`id_restaurante`);

--
-- Constraints for table `mesa`
--
ALTER TABLE `mesa`
  ADD CONSTRAINT `mesa_ibfk_1` FOREIGN KEY (`zona_fk`) REFERENCES `zona` (`id_zona`),
  ADD CONSTRAINT `mesa_ibfk_2` FOREIGN KEY (`estado_mesa_fk`) REFERENCES `estado_mesa` (`id_estado_mesa`),
  ADD CONSTRAINT `sucursal_fk` FOREIGN KEY (`sucursal_fk`) REFERENCES `sucursal` (`id_sucursal`);

--
-- Constraints for table `perfil`
--
ALTER TABLE `perfil`
  ADD CONSTRAINT `perfil_ibfk_1` FOREIGN KEY (`usuario_fk`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `perfil_ibfk_2` FOREIGN KEY (`tipo_documento_fk`) REFERENCES `tipo_documento` (`id_tipo_documento`);

--
-- Constraints for table `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`categoria_fk`) REFERENCES `categoria` (`id_categoria`),
  ADD CONSTRAINT `fk_producto_menu` FOREIGN KEY (`menu_fk`) REFERENCES `menu` (`id_menu`);

--
-- Constraints for table `qr_menu`
--
ALTER TABLE `qr_menu`
  ADD CONSTRAINT `qr_menu_ibfk_1` FOREIGN KEY (`restaurante_fk`) REFERENCES `restaurante` (`id_restaurante`),
  ADD CONSTRAINT `qr_menu_ibfk_2` FOREIGN KEY (`menu_fk`) REFERENCES `menu` (`id_menu`);

--
-- Constraints for table `reservacion`
--
ALTER TABLE `reservacion`
  ADD CONSTRAINT `fk_reservacion_mesa` FOREIGN KEY (`mesa_fk`) REFERENCES `mesa` (`id_mesa`),
  ADD CONSTRAINT `reservacion_ibfk_1` FOREIGN KEY (`usuario_fk`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `reservacion_ibfk_2` FOREIGN KEY (`estado_reservacion`) REFERENCES `estado_reservacion` (`id_estado_reservacion`),
  ADD CONSTRAINT `reservacion_ibfk_3` FOREIGN KEY (`restaurante_fk`) REFERENCES `restaurante` (`id_restaurante`),
  ADD CONSTRAINT `reservacion_sucursal_fk` FOREIGN KEY (`sucursal_fk`) REFERENCES `sucursal` (`id_sucursal`);

--
-- Constraints for table `rol`
--
ALTER TABLE `rol`
  ADD CONSTRAINT `id_restaurante_fk` FOREIGN KEY (`restaurante_fk`) REFERENCES `restaurante` (`id_restaurante`);

--
-- Constraints for table `sucursal`
--
ALTER TABLE `sucursal`
  ADD CONSTRAINT `restaurante_fk` FOREIGN KEY (`restaurante_fk`) REFERENCES `restaurante` (`id_restaurante`);

--
-- Constraints for table `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`estado_usuario_fk`) REFERENCES `estado_usuario` (`id_estado_usuario`),
  ADD CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`rol_fk`) REFERENCES `rol` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
