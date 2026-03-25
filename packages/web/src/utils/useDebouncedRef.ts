import { ref, watch, type Ref } from 'vue'

export function useDebouncedRef<T>(initial: T, delay = 300): [Ref<T>, Ref<T>] {
  const input = ref<T>(initial) as Ref<T>
  const debounced = ref<T>(initial) as Ref<T>
  let timer: ReturnType<typeof setTimeout>

  watch(input, (val) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = val
    }, delay)
  })

  return [input, debounced]
}
