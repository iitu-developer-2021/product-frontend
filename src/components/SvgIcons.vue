<template>
    <svg aria-hidden="true" :style="svgStyle">
        <use :xlink:href="symbolId" :fill="color" />
    </svg>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue"

export default defineComponent({
    name: "SvgIcon",
    props: {
        prefix: {
            type: String,
            default: "icon",
        },
        width: {
            type: String,
            default: null,
        },
        height: {
            type: String,
            default: null,
        },
        name: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            default: "#333",
        },
    },
    setup(props) {
        const svgStyle = computed(() => {
            const style = {} as { width?: string; height?: string; color?: string }

            if (props.width) {
                style.width = props.width
            }

            if (props.height) {
                style.height = props.height
            }

            if (props.color) {
                style.color = props.color
            }

            return style
        })
        const symbolId = computed(() => `#${props.prefix}-${props.name}`)
        return { symbolId, svgStyle }
    },
})
</script>
