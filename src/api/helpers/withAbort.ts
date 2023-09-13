type CustomFunction = (...args: any[]) => any
type CustomOriginalConfig = Record<string, any> & { abort?: CustomFunction }

export const withAbort =
  (fn: CustomFunction) =>
  <T>(...args: any): Promise<T> => {
    const originalConfig: CustomOriginalConfig = args[args.length - 1]
    const { abort, ...config } = originalConfig

    if (typeof abort === 'function') {
      const abortController = new AbortController()
      config.signal = abortController.signal
      abort(abortController.abort.bind(abortController))
    }

    try {
      return fn(...args.slice(0, args.length - 1), config)
    } catch (e) {
      if (didAbort(e)) {
        ;(e as any).aborted = true
      }
      throw e
    }
  }

export const didAbort = (e: any) => e.code === 'ERR_CANCELED'
