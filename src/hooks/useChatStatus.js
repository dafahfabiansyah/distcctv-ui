import { useQuery, useQueryClient, useQueries } from '@tanstack/react-query'
import pipelineService from '@/services/pipeline'

// Service untuk batch chat status (simulasi batch dalam 1 request)
const fetchBatchChatStatusOptimized = async (leads) => {
  console.log('🚀 Single optimized batch request for', leads.length, 'leads')
  
  // Gunakan Promise.all tapi dengan request batching/queuing
  const BATCH_SIZE = 5 // Process 5 requests at a time
  const results = {}
  
  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE)
    
    const batchPromises = batch.map(async (lead) => {
      try {
        const leadTimestamp = Math.floor(new Date(lead.created_at).getTime() / 1000)
        const response = await pipelineService.getLeadChatStatus(lead.phone, leadTimestamp)
        return { phone: lead.phone, data: response }
      } catch (error) {
        console.error(`Error fetching chat status for ${lead.phone}:`, error)
        return { phone: lead.phone, data: null }
      }
    })
    
    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(result => {
      if (result.phone) {
        results[result.phone] = result.data
      }
    })
    
    // Small delay between batches to avoid overwhelming server
    if (i + BATCH_SIZE < leads.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  console.log('✅ Optimized batch completed:', Object.keys(results).length, 'phones')
  return results
}

// Hook untuk fetch batch chat status dengan optimized individual requests
export const useBatchChatStatus = (leads = []) => {
  const leadsWithPhone = leads.filter(lead => lead.phone && lead.created_at)
  
  return useQuery({
    queryKey: ['chat-status-batch', leadsWithPhone.map(lead => `${lead.phone}-${lead.created_at}`).sort()],
    queryFn: async () => {
      if (leadsWithPhone.length === 0) return {}
      
      console.log('🚀 Optimized batch processing for', leadsWithPhone.length, 'leads')
      
      // Langsung gunakan optimized individual requests
      return await fetchBatchChatStatusOptimized(leadsWithPhone)
    },
    enabled: leadsWithPhone.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if data exists
    retry: 1,
  })
}

// Hook untuk mendapatkan chat status individual lead dari cache
export const useLeadChatStatus = (lead, batchChatStatus) => {
  // Ambil data dari batch result
  const chatStatus = batchChatStatus?.[lead?.phone] || null
  
  return {
    data: chatStatus,
    isLoading: false, // Always false karena data sudah ada dari batch
    error: null
  }
}

// Hook untuk invalidate cache chat status (untuk real-time updates)
export const useInvalidateChatStatus = () => {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries(['chat-status-batch'])
    },
    invalidatePhone: (phone) => {
      // Invalidate semua queries yang mengandung phone tersebut
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey
          return queryKey[0] === 'chat-status-batch' && 
                 queryKey[1] && 
                 queryKey[1].includes(phone)
        }
      })
    }
  }
}
