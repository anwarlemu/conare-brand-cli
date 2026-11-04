<template>
  <!-- Rows of one list, a hairline between each (console2.css .v2-rows). Put Item rows in it, one per <li>. -->
  <ul class="flex flex-col [&>*+*]:border-t [&>*+*]:border-edge"><slot /></ul>
</template>
