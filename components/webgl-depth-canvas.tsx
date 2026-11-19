"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function WebGLDepthCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.z = 12;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Soft floating particles in Deep Green, Plum, and Warm Gold
    const particleCount = 110;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color("#135D43"),
      new THREE.Color("#4E203D"),
      new THREE.Color("#C58B3B"),
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.42,
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // Subtle 3D architectural wireframe shapes
    const wireGroup = new THREE.Group();
    const shape1 = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 0),
      new THREE.MeshBasicMaterial({
        color: "#135D43",
        wireframe: true,
        transparent: true,
        opacity: 0.08,
      })
    );
    shape1.position.set(-7.5, 2.2, -2);
    wireGroup.add(shape1);

    const shape2 = new THREE.Mesh(
      new THREE.OctahedronGeometry(2.1, 0),
      new THREE.MeshBasicMaterial({
        color: "#C58B3B",
        wireframe: true,
        transparent: true,
        opacity: 0.1,
      })
    );
    shape2.position.set(7.8, -2.0, -3);
    wireGroup.add(shape2);

    const shape3 = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.35, 8, 24),
      new THREE.MeshBasicMaterial({
        color: "#4E203D",
        wireframe: true,
        transparent: true,
        opacity: 0.07,
      })
    );
    shape3.position.set(0.5, 3.8, -4);
    wireGroup.add(shape3);

    scene.add(wireGroup);

    let targetMouseX = 0;
    let targetMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 1.4;
      targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 1.1;
    };

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      particles.rotation.y = t * 0.025 + targetMouseX * 0.12;
      particles.rotation.x = targetMouseY * 0.08;

      shape1.rotation.x = t * 0.12;
      shape1.rotation.y = t * 0.16;
      shape2.rotation.x = -t * 0.14;
      shape2.rotation.z = t * 0.1;
      shape3.rotation.y = t * 0.11;
      shape3.rotation.x = t * 0.08;

      camera.position.x += (targetMouseX - camera.position.x) * 0.03;
      camera.position.y += (targetMouseY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      particleGeom.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
