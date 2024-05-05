class Solution(object):
    def twoSum(self, nums, target):
        times = 0
        print(nums)
        length = len(nums) #4
        i = 0
        j = length - 1
        # Check every element of the sorted list
        while True:
            times += 1
            last_j = j
            if (times > pow(length, 2) + 2):
                return
            if (i == j):
                return []
            # Establish a pivot
            pivot = nums[i] # 0
            print("pivot = ", pivot)
            # Establish iterated element
            iterated_element = nums[j]
            print("last pointer =,", iterated_element)
            # Get sum 
            sum = pivot + iterated_element
            # If sum equals target return result
            if sum == target:
                return [i, j]

            # If sum is greather then sum will be greater by switching 
            # the pivot to the next element which is greater only if pivot
            # is not the first element
            if (sum > target):
                j -= 1
                continue

            # If sum is lesser than target then sum will be greater by  
            # switching the iterated element to the previous element 
            # which is lesser
            if (sum < target):
                print("target is larger")
                i += 1
                print("then add 1 to i", i)
                continue

            # If all elements after pivot have been checked then change pivot
            print(f'{j} - 1 == {j - 1}')
            if (j - 1 == i):
                print("True")
                i += 1
                print(length)
                j = length - 1
                print(j)
                continue


solution = Solution()
print(solution.twoSum([2,7,11,15], 9))
