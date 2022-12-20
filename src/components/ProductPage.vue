<template>
  <div class="productTileContainer">
    <ProductTile
      productTitle="Lychi"
      procuctPrice="0,99"
      productDescription="Tastes great!"
    />
  </div>
</template>

<script>
import ProductTile from "./ProductTile.vue";
export default {
  name: "ProductPage",
  components: { ProductTile },
};
</script>

<style>
.productTileContainer {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>