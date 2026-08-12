# Remotion Three Adapter

Status: **experimental**.

This adapter owns deterministic 3D camera/orbit math for IMON MOTION and is the implementation path for semantic primitive `camera.product-orbit`.

Implemented now:

- deterministic spherical product-orbit camera pose;
- configurable center/radius/azimuth/elevation/FOV;
- cinematic or linear progress;
- frame → normalized progress binding;
- clamped pre/post authored camera movement;
- unit tests for determinism and distance continuity.

Not production-ready yet:

- no committed `@remotion/three` / React Three Fiber canvas binding;
- no actual 3D object/material scene contract;
- no render-level 3D smoke test;
- no WebGL/GPU fallback validation.

Until those gates are complete, routing should surface `camera.product-orbit` as `adapter-required`. The approved fallback is `camera.parallax-2_5d` / `Camera2D + DepthPlane`.

The point of the adapter is to keep true spatial camera logic outside `motion-core` while preserving deterministic frame-based behavior for Remotion.
