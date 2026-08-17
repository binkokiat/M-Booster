<template>
    <div class="text-center">
        <v-overlay>
        <div class="loading-content">
            <img src="../assets/logo mind booster.png" width="50%">
            <v-progress-linear
                height="10"
                indeterminate
                color="orange"
                rounded
            ></v-progress-linear>
        </div>   
        </v-overlay>
    </div>
</template>

<style scoped>
.loading-content {
    width: 40%;
    display: inline-block;
}
</style>
