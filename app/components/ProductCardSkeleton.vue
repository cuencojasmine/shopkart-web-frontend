<!-- Placeholder with the same shape as ProductCard, shown while products load. -->
<template>
  <div class="product-skeleton h-100" aria-hidden="true">
    <span class="sk-skel skel-image" />

    <div class="skel-body">
      <span class="sk-skel" style="width: 38%; height: 10px" />
      <span class="sk-skel mt-2" style="width: 82%; height: 14px" />
      <span class="sk-skel skel-desc mt-3" style="width: 100%; height: 10px" />
      <span class="sk-skel skel-desc mt-1" style="width: 64%; height: 10px" />

      <div class="d-flex align-center justify-space-between ga-2 mt-4">
        <span class="sk-skel" style="width: 46%; height: 18px" />
        <span class="sk-skel" style="width: 28%; height: 10px" />
      </div>

      <span class="sk-skel sk-skel-pill skel-button" />
    </div>
  </div>
</template>

<style scoped>
.product-skeleton {
  padding: 10px;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
  border-radius: 22px;
}

.skel-image {
  aspect-ratio: 1 / 0.86;
  border-radius: 16px;
}

.skel-body {
  padding: 14px 6px 4px;
}

.skel-button {
  height: 36px;
  margin-top: 14px;
}

@media (max-width: 599px) {
  .product-skeleton {
    padding: 6px;
    border-radius: 18px;
  }

  .skel-image {
    border-radius: 14px;
  }

  .skel-body {
    padding: 12px 4px 2px;
  }

  /* ProductCard hides its description on phones */
  .skel-desc {
    display: none;
  }
}
</style>
