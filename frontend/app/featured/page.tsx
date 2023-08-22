"use client";

import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

import Image from "next/image";
import { useEffect } from "react";
import Header from "@components/header";
import VirtualScroll from "virtual-scroll";
import { createGlobalStyle } from "styled-components";

import postvertex from "./shaders/postvertex.glsl";
import postfragment from "./shaders/postfragment.glsl";

const GlobalStyle = createGlobalStyle`
  body {
   overscroll-behavior: none !important;
  }
`;

const texts = [
  "Miraculous",
  "Aurora",
  "Euphoria",
  "Serendipity",
  "Cherish",
  "Elixir",
  "Eternity",
  "Luxury",
  "Serenity",
  "Bliss",
  "Harmony",
];

function Featured() {
  useEffect(() => {
    const container = document.getElementById("featured");
    if (!container) return;

    let speed = 0;
    let position = 0;
    let viewport = {
      height: 0,
      width: 0,
    };
    let mouse = new THREE.Vector2();

    let customPass: ShaderPass;
    let composer: EffectComposer;
    let textMeshes: THREE.Mesh[] = [];
    let plane: THREE.Mesh | null = null;
    let planematerial: THREE.ShaderMaterial;

    let textures = Array.from(
      document.querySelectorAll(".featured__image")
    ).map(t => new THREE.TextureLoader().load((t as HTMLImageElement)?.src));

    // === Setup ===
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const fov = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(fov / 2) * camera.position.z;
    const width = height * camera.aspect;

    viewport = {
      height,
      width,
    };
    const group = new THREE.Group();
    const groupPlane = new THREE.Group();
    scene.add(group, groupPlane);

    // === Scoller ===
    const scroller = new VirtualScroll();
    scroller.on(event => {
      position = event.y / 4000;
      speed = event.deltaY / 1000;
    });

    // === Text ===
    const createTexts = () => {
      const loader = new FontLoader();
      loader.load("Neue Montreal Medium_Regular.json", function (font) {
        const size = 14;
        const material = new THREE.MeshStandardMaterial({
          color: "#222",
          side: THREE.DoubleSide,
        });

        textMeshes = texts.map((text, i) => {
          const geometry = new TextGeometry(text.toUpperCase(), {
            size,
            font: font,
            height: 0.0001,
            bevelSize: 0,
            curveSegments: 100,
            bevelThickness: 0,
            bevelEnabled: true,
          });

          const textMesh = new THREE.Mesh(geometry, material);
          let s = 0.05;
          textMesh.scale.set(s, s, s);
          textMesh.position.y = -size * i * 0.067;
          group.add(textMesh);

          return textMesh;
        });

        // Calculate the bounding box of the group
        const boundingBox = new THREE.Box3().setFromObject(group);
        const groupWidth = boundingBox.max.x - boundingBox.min.x;

        // Center the group horizontally
        group.position.x = -groupWidth / 2;
        // center the group vertically
      });
    };

    createTexts();

    // === Post Processing ===
    const initPostProcessing = () => {
      // Create EffectComposer and passes
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      //custom shader pass
      var myEffect = {
        uniforms: {
          tDiffuse: { value: null },
          resolution: {
            value: new THREE.Vector2(1, window.innerHeight / window.innerWidth),
          },
          uMouse: { value: new THREE.Vector2(-10, -10) },
          uVelo: { value: 0.02 },
        },
        vertexShader: postvertex,
        fragmentShader: postfragment,
      };

      customPass = new ShaderPass(myEffect);
      customPass.renderToScreen = true;
      composer.addPass(customPass);
    };

    initPostProcessing();

    // === Update ===
    const update = function () {
      textMeshes.forEach((textMesh, i) => {
        const scaleY = textMesh.scale.y * 14;
        const positionInViewport = textMesh.position
          .clone()
          .add(group.position);

        if (speed < 0) {
          const y = positionInViewport.y;

          if (y > viewport.height / 2) {
            // move to the bottom of the group
            const lastTextMesh = textMeshes[textMeshes.length - 1];
            const textHeight = 14 * 0.067; // Height of each text mesh
            textMesh.position.y = lastTextMesh.position.y - textHeight;

            textMeshes.splice(i, 1);
            textMeshes.push(textMesh);
          }
        } else {
          const y = positionInViewport.y + scaleY;

          if (y < -viewport.height / 2) {
            // move to the top of the group
            const firstTextMesh = textMeshes[0];
            const textHeight = 14 * 0.067; // Height of each text mesh
            textMesh.position.y = firstTextMesh.position.y + textHeight;

            textMeshes.splice(i, 1);
            textMeshes.unshift(textMesh);
          }
        }
      });

      group.position.y = -position;

      // renderer.render(scene, camera);

      customPass.uniforms.uMouse.value = mouse;
      // customPass.uniforms.uVelo.value = speed;
      if (composer) composer.render();

      requestAnimationFrame(update);
    };
    update();

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX / window.innerWidth;
      mouse.y = 1 - event.clientY / window.innerHeight;
    };

    window.addEventListener("mousemove", onMouseMove, false);
  }, []);

  return (
    <>
      <GlobalStyle />

      <Header showSearchbar={false} />
      <main className="app-container">
        <>
          <div id="featured" className="featured">
            <div className="images" hidden>
              {[...Array(5)].map((_, i) => {
                return (
                  <Image
                    key={i}
                    width={100}
                    height={100}
                    className="featured__image"
                    src={`/images/${i + 1}.jpg`}
                    alt=""
                  />
                );
              })}
            </div>
          </div>
        </>
      </main>
    </>
  );
}

export default Featured;
