<template>
  <div class="productContainer">
    <canvas></canvas>
    <div class="productDetailContainer">
      <div class="headlineContainer">
        <h1>{{ productTitle }}</h1>
        <h2>{{ procuctPrice }} $</h2>
      </div>
      <div class="descriptionContainer">
        <p>Description</p>
        <p>{{ productDescription }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { CameraMechanics } from "../BabylonExamples/CameraMechanics";

export default {
  name: "ProductTile",
  props: {
    productTitle: String,
    procuctPrice: String,
    productDescription: String,
  },
  mounted() {
    const canvas = document.querySelector("canvas");

    new CameraMechanics(canvas);
  },
};
</script>

<style>
.productContainer {
  background: rgb(255, 152, 114);
  width: 70vw;
  height: 50vw;
  filter: drop-shadow(10px 10px 20px #000000);
  display: flex;
  /* border-radius: 20px; */
}

.productDetailContainer {
  padding: 50px ;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
}

canvas {
  width: 50%;
  /* border-radius: 20px; */
}
</style>